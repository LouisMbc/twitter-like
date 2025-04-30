"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

interface ViewCounterProps {
  contentId: string;
  contentType: 'tweet' | 'comment';
  initialCount?: number; // Ajouter cette propriété
}

// Fonction pour générer un UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ViewCounter({ contentId, contentType, initialCount = 0 }: ViewCounterProps) {
  const [views, setViews] = useState(initialCount); // Utiliser la valeur initiale
  
  useEffect(() => {
    // Ne pas recompter si nous avons déjà une valeur initiale non nulle
    if (initialCount > 0) {
      setViews(initialCount);
    }

    // Ne compter les vues que côté client
    if (typeof window === 'undefined') return;
    
    // Récupérer ou créer un identifiant visiteur unique
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = generateUUID();
      localStorage.setItem('visitor_id', visitorId);
    }

    const updateViews = async () => {
      try {
        console.log('Starting view count update:', { contentId, contentType, visitorId });
        
        // Déterminer la colonne à utiliser
        const idColumn = contentType === 'tweet' ? 'tweet_id' : 'comment_id';
        
        // Récupérer d'abord le compteur de vues actuel depuis la table de contenu
        const contentTable = contentType === 'tweet' ? 'Tweets' : 'Comments';
        
        const { data: contentData } = await supabase
          .from(contentTable)
          .select('view_count')
          .eq('id', contentId)
          .single();
          
        console.log('Current view count from content table:', contentData);
        
        // Vérifier si l'entrée existe déjà dans la table views
        const { data: viewData } = await supabase
          .from('views')
          .select('id, views_count, viewers')
          .eq(idColumn, contentId)
          .single();
          
        console.log('View data from views table:', viewData);
        
        // Vérifier si l'utilisateur a déjà vu ce contenu
        // IMPORTANT: viewers est un JSONB array, pas un JavaScript array
        let hasViewed = false;
        let currentViewers = [];
        
        if (viewData && viewData.viewers) {
          try {
            // Si c'est déjà un array JavaScript
            if (Array.isArray(viewData.viewers)) {
              currentViewers = viewData.viewers;
              hasViewed = currentViewers.includes(visitorId);
            } 
            // Si c'est un string JSON
            else if (typeof viewData.viewers === 'string') {
              currentViewers = JSON.parse(viewData.viewers);
              hasViewed = currentViewers.includes(visitorId);
            }
            // Si c'est déjà un objet JSON parsé
            else {
              currentViewers = viewData.viewers;
              hasViewed = currentViewers.includes(visitorId);
            }
          } catch (e) {
            console.error('Error parsing viewers:', e);
          }
        }
        
        console.log('Viewer status:', { hasViewed, currentViewers });
        
        // Si l'utilisateur a déjà vu ce contenu, juste retourner le compte actuel
        if (hasViewed) {
          console.log('User already viewed this content');
          setViews(viewData?.views_count || contentData?.view_count || 0);
          return;
        }
        
        // L'utilisateur n'a pas encore vu ce contenu, incrémenter le compteur
        const newViewCount = ((viewData?.views_count || contentData?.view_count) || 0) + 1;
        const updatedViewers = [...currentViewers, visitorId];
        
        console.log('Updating view count:', { newViewCount, updatedViewers });
        
        // Préparer les données pour l'upsert
        const viewsData = {
          views_count: newViewCount,
          viewers: updatedViewers
        };
        
        // Ajouter la colonne d'ID appropriée
        viewsData[idColumn] = contentId;
        
        // Mettre à jour ou créer l'entrée dans la table views
        const { error: viewsError } = await supabase
          .from('views')
          .upsert([viewsData]);
          
        if (viewsError) {
          console.error('Error updating views table:', viewsError);
          return;
        }
        
        // Mettre à jour également la table de contenu
        const { error: contentError } = await supabase
          .from(contentTable)
          .update({ view_count: newViewCount })
          .eq('id', contentId);
          
        if (contentError) {
          console.error('Error updating content table:', contentError);
          return;
        }
        
        // Mettre à jour l'affichage
        setViews(newViewCount);
        console.log('View count updated successfully to', newViewCount);
      } catch (error) {
        console.error('Error in view counter:', error);
      }
    };

    // Mettre à jour les vues
    updateViews();
  }, [contentId, contentType, initialCount]);

  return <span className="text-sm text-gray-500">{views} vue{views !== 1 ? 's' : ''}</span>;
}