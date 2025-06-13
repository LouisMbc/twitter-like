import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { Story } from '@/types/story';

interface StoryData {
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  duration: number;
  Profile: {
    id: string;
    nickname: string;
    profilePicture?: string;
  } | null;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Récupération des stories...');
      
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
        throw error;
      }
      
      console.log('✅ Stories récupérées:', data?.length || 0);
      
      // S'assurer que les données ne sont pas null/undefined
      if (!data || data.length === 0) {
        console.log('ℹ️ Aucune story trouvée');
        setStories([]);
        return;
      }
      
      // Formater les données pour correspondre à l'interface Story
      const formattedStories = data.map((story: StoryData) => ({
        ...story,
        author: story.Profile || {
          id: 'unknown',
          nickname: 'Utilisateur',
          profilePicture: null
        }
      }));

      console.log('✅ Stories formatées:', formattedStories.length);
      setStories(formattedStories);
    } catch {
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