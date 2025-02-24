"use client";

import { useAuth } from '@/hooks/useAuth';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetActions from '@/components/tweets/TweetActions';
import TweetCard from '@/components/tweets/TweetCard';
import TweetForm from '@/components/tweets/TweetForm';
import TweetList from '@/components/tweets/TweetList';
import { useRouter } from 'next/navigation';

import { Tweet } from '@/types';

export default function CreateTweetPage() {
  const router = useRouter();
  useAuth();

  const onTweetCreated = () => {
    router.push('/dashboard');
  };

  const handleTweetSubmit = async (tweetContent: string) => {
    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: tweetContent }),
      });

      if (response.headers.get('content-type')?.includes('application/json')) {
        const parsedContent = await response.json();
      } else {
        console.error("Unexpected response content type:", response.headers.get('content-type'));
      }
    } catch (error) {
      console.error("Failed to submit tweet:", error);
    }
  };

  const tweetId = "exampleTweetId"; 
  const tweets: Tweet[] = [];
  const tweet: Tweet = {
    id: "exampleTweetId",
    content: "Example tweet content",
    published_at: "2023-01-01T00:00:00Z",
    view_count: 0,
    // retweet_count: 0,
    author_id: "exampleAuthorId",
    comments: [],
    author: {
      id: "exampleAuthorId",
      name: "Example Author",
      username: "exampleauthor",
      profile_image_url: "https://example.com/profile.jpg",
      profilePicture: null,
      nickname: ''
    },
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Créer un tweet</h1>
      <TweetComposer onSuccess={onTweetCreated} />
      <TweetForm onTweetSubmit={handleTweetSubmit} />
      <TweetActions tweetId={tweetId} />
      <TweetList tweets={tweets} />
      <TweetCard tweet={tweet} />
    </div>
  );
}