import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { Story } from '@/types/story';

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les stories qui ne sont pas encore expirées
      const now = new Date();
      
      const { data, error } = await supabase
        .from('Stories')
        .select(`
          id,
          user_id,
          content,
          media_url,
          media_type,
          created_at,
          expires_at,
          duration,
          Profile:user_id (
            id,
            nickname,
            profilePicture
          )
        `)
        .gt('expires_at', now.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
      
      console.log('Données brutes des stories:', data);

      // S'assurer que les données ne sont pas null/undefined
      if (!data || data.length === 0) {
        console.log('Aucune story trouvée');
        setStories([]);
        return;
      }

      // Formater les données pour correspondre à l'interface Story
      const formattedStories = data.map((story: any) => {
        // Log pour chaque story pour vérifier sa structure
        console.log('Story brute:', story);
        
        return {
          ...story,
          author: story.Profile || {
            id: 'unknown',
            nickname: 'Utilisateur',
            profilePicture: null
          }
        };
      });

      console.log('Stories formatées:', formattedStories);
      setStories(formattedStories);
    } catch (err) {
      console.error('Erreur lors du chargement des stories:', err);
      setError('Impossible de charger les stories');
      setStories([]); // S'assurer d'avoir un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les stories au montage du composant
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Fonction pour rafraîchir les stories
  const refreshStories = useCallback(() => {
    fetchStories();
  }, [fetchStories]);

  return { stories, loading, error, refreshStories };
}