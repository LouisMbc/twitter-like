"use client";

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

interface ViewCountProps {
  contentId: string;
  contentType: 'tweet' | 'comment';
  initialCount?: number;
}

export default function ViewCount({ contentId, contentType, initialCount = 0 }: ViewCountProps) {
  const [viewCount, setViewCount] = useState(initialCount);

  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // D'abord récupérer l'ID du profil
        const { data: profile } = await supabase
          .from('Profile')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // Utiliser upsert au lieu de insert
          const { error } = await supabase
            .from('ViewCount')
            .upsert(
              {
                viewer_id: profile.id,
                [contentType === 'tweet' ? 'tweet_id' : 'comment_id']: contentId,
                viewed_at: new Date().toISOString()
              },
              {
                    // Spécifier toutes les colonnes qui peuvent être en conflit
                onConflict: contentType === 'tweet' 
                  ? 'viewer_id,tweet_id' 
                  : 'viewer_id,comment_id'
              }
            );

          if (error) throw error;

          // Récupérer le nouveau compte de vues
          const { count } = await supabase
            .from('ViewCount')
            .select('*', { count: 'exact' })
            .eq(contentType === 'tweet' ? 'tweet_id' : 'comment_id', contentId);

          setViewCount(count || 0);

          // Mettre à jour le compteur dans la table appropriée
          await supabase
            .from(contentType === 'tweet' ? 'Tweets' : 'Comments')
            .update({ view_count: count })
            .eq('id', contentId);
        }
      } catch (error) {
        console.error('Erreur lors du comptage de la vue:', error);
      }
    };

    incrementViewCount();
  }, [contentId, contentType]);

  return (
    <div className="flex items-center text-sm text-gray-500">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className="w-4 h-4 mr-1"
      >
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
      <span>{viewCount.toLocaleString()} vues</span>
    </div>
  );
}