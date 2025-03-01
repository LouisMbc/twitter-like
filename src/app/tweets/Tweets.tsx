"use client";

import { useAuth } from '@/hooks/useAuth';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetActions from '@/components/tweets/TweetActions';
import TweetCard from '@/components/tweets/TweetCard';
import TweetForm from '@/components/tweets/TweetForm';
import TweetList from '@/components/tweets/TweetList';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

import { Tweet } from '@/types';

export default function CreateTweetPage() {
  const router = useRouter();
  useAuth();

  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    async function fetchTweets() {
      try {
        const { data, error } = await supabase
          .from('Tweets')
          .select('*');

        if (error) {
          console.error('Erreur de connexion:', error.message);
        } else {
          setTweets(data as Tweet[]);
        }
      } catch (err) {
        console.error('Erreur:', (err as Error).message);
      }
    }

    fetchTweets();
  }, []);

  const onTweetCreated = () => {
    router.push('/dashboard');
  };

  const handleTweetSubmit = async (tweetContent: string) => {
    try {
      const author = {
        id: "exampleAuthorId",
        name: "Example Author",
        username: "exampleauthor",
        profile_image_url: "https://example.com/profile.jpg",
        profilePicture: null,
        nickname: ''
      };

      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: tweetContent, author }),
      });

      if (response.headers.get('content-type')?.includes('application/json')) {
        const parsedContent = await response.json();
        // Handle the parsed content if needed
      } else {
        console.error("Unexpected response content type:", response.headers.get('content-type'));
      }
    } catch (error) {
      console.error("Failed to submit tweet:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Créer un tweet</h1>
      <TweetComposer onSuccess={onTweetCreated} />
      <TweetForm onTweetSubmit={handleTweetSubmit} />
      <TweetList tweets={tweets} />
    </div>
  );
}