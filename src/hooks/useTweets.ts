// src/hooks/useTweets.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tweetService } from '@/services/supabase/tweet';

export const useTweets = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTweet = async (content: string, authorId: string) => {
    try {
      setLoading(true);
      const { error } = await tweetService.createTweet(content, authorId);
      if (error) throw error;
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du tweet');
    } finally {
      setLoading(false);
    }
  };

  return { createTweet, loading, error };
};// Hook pour les tweets