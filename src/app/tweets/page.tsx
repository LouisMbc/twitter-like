"use client";

import { useAuth } from '@/hooks/useAuth';
import TweetComposer from '@/components/tweets/TweetComposer';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

export default function CreateTweetPage() {
  const router = useRouter();
  useAuth(); // Protection de la route

  const onTweetCreated = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur-sm p-4 border-b border-gray-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="p-2 rounded-full hover:bg-gray-800"
          >
            <FaArrowLeft />
          </button>
          <button 
            onClick={onTweetCreated}
            className="text-red-500 font-medium"
          >
            Annuler
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto border-x border-gray-800 p-4">
        <TweetComposer onSuccess={onTweetCreated} />
      </div>
    </div>
  );
}