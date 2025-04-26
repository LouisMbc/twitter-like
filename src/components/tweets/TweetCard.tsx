"use client";

import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import ReactionBar from '@/components/reactions/ReactionBar';
import ViewCount from '@/components/shared/ViewCount';
import { Tweet } from '@/types';
import { useProfile } from '@/hooks/useProfile';

interface TweetCardProps {
  tweet: Tweet;
  detailed?: boolean;
}

export default function TweetCard({ tweet, detailed = false }: TweetCardProps) {
  const router = useRouter();
  const { profile } = useProfile();

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    return formatDistance(parsedDate, new Date(), {
      addSuffix: true,
      locale: fr
    });
  };

  const handleClick = () => {
    if (!detailed) {
      router.push(`/tweets/${tweet.id}`);
    }
  };

  if (!tweet) {
    console.error('Tweet manquant');
    return <div>Tweet non disponible</div>;
  }

  if (!tweet?.author) {
    console.warn(`⚠️ Tweet sans auteur ! ID: ${tweet.id}`, tweet);
    return <div className="text-red-500">Erreur : ce tweet n'a pas d'auteur.</div>;
  }

  return (
    <div 
      onClick={handleClick}
      className={`p-4 bg-white rounded-lg ${!detailed && 'cursor-pointer hover:bg-gray-50'}`}
    >
      <article className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
            {tweet.author.profilePicture ? (
              <img
                src={tweet.author.profilePicture}
                alt={tweet.author.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl text-gray-500">
                  {tweet.author.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900">
              {tweet.author.nickname}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(tweet.published_at)}
            </p>
          </div>
        </div>

        <p className="text-gray-800 mb-4">{tweet.content}</p>

        {tweet.picture && tweet.picture.length > 0 && (
          <div className="mb-4">
            <img
              src={tweet.picture[0]}
              alt="Tweet image"
              className="rounded-lg max-h-96 w-auto"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-gray-500">
          <ViewCount 
            contentId={tweet.id} 
            contentType="tweet"
            initialCount={tweet.view_count}
          />
          <div onClick={(e) => e.stopPropagation()}>
            <ReactionBar tweetId={tweet.id} />
          </div>
        </div>
      </article>
    </div>
  );
}