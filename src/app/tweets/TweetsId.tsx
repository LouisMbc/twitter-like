"use client";

import { useParams, useRouter } from 'next/navigation';
import TweetCard from '@/components/tweets/TweetCard';
import CommentForm from '@/components/comments/CommentForm';
import CommentList from '@/components/comments/CommentList';
import { useTweetDetails } from '@/hooks/useTweetDetails';

export default function TweetPage() {
  const params = useParams();
  const router = useRouter();
  const tweetId = Array.isArray(params.tweetId) ? params.tweetId[0] : params.tweetId;
  const { tweet, loading, error } = useTweetDetails(tweetId as string);

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
          {tweet.id && <CommentList tweetId={tweet.id} comments={tweet.comments} />}
        </div>
      </div>
    </div>
  );
}