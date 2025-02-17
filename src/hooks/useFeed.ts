import { useState, useEffect } from 'react';
import { Tweet } from '@/types';
import supabase from '@/lib/supabase';

export default function useFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      // Récupérer l'ID du profil de l'utilisateur connecté
      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      // Récupérer les tweets des personnes suivies
      const { data: feedTweets, error: tweetsError } = await supabase
        .from('Tweets')
        .select(`
          *,
          author:Profile!author_id (
            id,
            nickname,
            profilePicture
          )
        `)
        .in('author_id', 
          supabase
            .from('Following')
            .select('following_id')
            .eq('follower_id', profile.id)
        )
        .order('published_at', { ascending: false });

      if (tweetsError) throw tweetsError;
      setTweets(feedTweets || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return { tweets, loading, error, refreshFeed: fetchFeed };
}