"use client";

import { useParams, useRouter } from 'next/navigation';
import TweetCard from '@/components/tweets/TweetCard';
import CommentForm from '@/components/comments/CommentForm';
import CommentList from '@/components/comments/CommentList';
import { useTweetDetails } from '@/hooks/useTweetDetails';
import Image from 'next/image';
import Header from '@/components/shared/Header';



export default function TweetPage() {
  const params = useParams();
  const router = useRouter();
  const tweetId = params.tweetId as string;
  
  const { tweet, loading, error } = useTweetDetails(tweetId);

  if (!tweetId) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-red-500 text-center py-20">Identifiant de tweet manquant</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-center py-20">
          <div className="animate-pulse flex justify-center">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={120} 
              height={40} 
              priority
            />
          </div>
          <div className="mt-4">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !tweet) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="text-red-500 text-center py-20">{error || 'Tweet non trouvé'}</div>
      </div>
    );
  }

  const loadComments = () => {
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Header />
      
      <div className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen pb-20">
          <div className="border-b border-gray-800">
            <TweetCard tweet={tweet} detailed />
          </div>

          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
            <CommentForm 
              tweetId={tweet.id} 
              onCommentAdded={loadComments}
            />
          </div>
          <div className="mt-6 px-4">
            {tweet.id && <CommentList tweetId={tweet.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}