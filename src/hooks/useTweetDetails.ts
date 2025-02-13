import { useState, useEffect } from 'react';
import { Tweet } from '@/types';
import { tweetService } from '@/services/supabase/tweet';

export const useTweetDetails = (tweetId: string) => {
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTweet = async () => {
      try {
        const { data: tweetData, error: tweetError } = await tweetService.getTweetById(tweetId);
        
        if (tweetError) throw tweetError;
        if (!tweetData) throw new Error('Tweet non trouvé');

        const { error: viewError } = await tweetService.incrementViewCount(tweetId, tweetData.view_count);
        if (viewError) console.error('Erreur lors de la mise à jour des vues:', viewError);

        setTweet(tweetData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (tweetId) {
      loadTweet();
    }
  }, [tweetId]);

  return { tweet, loading, error };
};