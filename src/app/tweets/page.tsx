"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { FC, useState } from 'react';
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';

interface TweetComposerProps {
  onSuccess?: () => void;
}
const TweetComposer: FC<TweetComposerProps> = ({ onSuccess }) => {
  const [tweetContent, setTweetContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!tweetContent.trim()) return;
    
    setIsLoading(true);
    try {
      // Implement your tweet creation logic here
      // Example: await createTweet(tweetContent);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create tweet:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="bg-white border border-gray-800 rounded-lg p-4 resize-none h-32 text-black focus:ring-2 focus:ring-red-500 focus:outline-none"
        placeholder="Que voulez-vous partager?"
        value={tweetContent}
        onChange={(e) => setTweetContent(e.target.value)}
      />
      <button
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full self-end disabled:bg-gray-700 disabled:text-gray-300"
        onClick={handleSubmit}
        disabled={isLoading || !tweetContent.trim()}
      >
        {isLoading ? 'Publication...' : 'Publier'}
      </button>
    </div>
  );
};

export default function CreateTweetPage() {
  const router = useRouter();
  useAuth(); // Protection de la route

  const onTweetCreated = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur-sm p-4 border-b border-gray-800">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-gray-800 text-white"
            >
              <FaArrowLeft />
            </button>
            <button 
              onClick={onTweetCreated}
              className="text-red-500 font-medium hover:text-red-400"
            >
              Annuler
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto border-x border-gray-800 p-4">
          <TweetComposer onSuccess={onTweetCreated} />
        </div>
      </div>
    </div>
  );
}