"use client";

import { useAuth } from '@/hooks/useAuth';
import TweetComposer from '@/components/tweets/TweetComposer';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Header from '@/components/shared/Header';

export default function CreateTweetPage() {
  const router = useRouter();
  useAuth(); // Protection de la route

  const onTweetCreated = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Header />
      <div className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-800 mr-4"
            >
              <FaArrowLeft className="text-red-500" />
            </button>
            <h1 className="text-xl font-bold">Créer un tweet</h1>
          </div>
          <TweetComposer onSuccess={onTweetCreated} />
        </div>
      </div>
    </div>
  );
}