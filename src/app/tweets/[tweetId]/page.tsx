"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import TweetCard from '@/components/tweets/TweetCard';
import CommentForm from '@/components/comments/CommentForm';
import CommentList from '@/components/comments/CommentList';
import { Tweet } from '@/types';

export default function TweetPage() {
  const params = useParams();
  const router = useRouter();
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTweet = async () => {
      try {
        const { data: tweetData, error: tweetError } = await supabase
          .from('Tweets')
          .select(`
            *,
            author:Profile!author_id (
              id,
              nickname,
              profilePicture
            )
          `)
          .eq('id', params.tweetId)
          .single();

        if (tweetError) throw tweetError;
        if (!tweetData) throw new Error('Tweet non trouvé');

        // Incrémenter le compteur de vues
        const { error: viewError } = await supabase
          .from('Tweets')
          .update({ view_count: (tweetData.view_count || 0) + 1 })
          .eq('id', params.tweetId);

        if (viewError) console.error('Erreur lors de la mise à jour des vues:', viewError);

        setTweet(tweetData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (params.tweetId) {
      loadTweet();
    }
  }, [params.tweetId]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (error || !tweet) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-500 text-center">{error || 'Tweet non trouvé'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow">
        <TweetCard tweet={tweet} detailed />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
        <CommentForm 
          tweetId={tweet.id} 
          onCommentAdded={() => router.refresh()}
        />
        <div className="mt-6">
          <CommentList tweetId={tweet.id} />
        </div>
      </div>
    </div>
  );
}