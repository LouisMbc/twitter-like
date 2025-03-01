"use client";

import { Tweet } from '@/types';

interface TweetListProps {
  tweets: Tweet[];
}

export default function TweetList({ tweets }: TweetListProps) {
  return (
    <div>
      {tweets.map((tweet) => (
        <div key={tweet.id} className="p-4 border-b border-gray-200">
          <p>{tweet.content}</p>
        </div>
      ))}
    </div>
  );
}