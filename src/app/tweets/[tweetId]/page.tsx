"use client";

import { useParams, useRouter } from 'next/navigation';
import TweetCard from '@/components/tweets/TweetCard';
import CommentForm from '@/components/comments/CommentForm';
import CommentList from '@/components/comments/CommentList';
import { useTweetDetails } from '@/hooks/useTweetDetails';

export default function TweetPage() {
  const params = useParams();
  const router = useRouter();
  const { tweet, loading, error } = useTweetDetails(params.tweetId);

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

  const loadComments = () => {
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow">
        <TweetCard tweet={tweet} detailed />
      </div>

      <div id="comments" className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
        <CommentForm 
          tweetId={tweet.id} 
          onCommentAdded={loadComments} 
        />
        <div className="mt-6">
          <CommentList tweetId={tweet.id} />
        </div>
      </div>
    </div>
  );
}