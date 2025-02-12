"use client";

import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import CommentList from '@/components/comments/CommentList';
import ReactionBar from '@/components/reactions/ReactionBar';
import supabase from '@/lib/supabase';
import ViewCount from '@/components/shared/ViewCount';
import CommentForm from '../comments/CommentForm';

interface TweetCardProps {
  tweet: {
    id: string;
    content: string;
    picture: string[] | null;
    published_at: string;
    view_count: number;
    retweet_id: string | null;
    author: {
      id: string;
      nickname: string;
      profilePicture: string | null;
    };
  }
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const [showComments, setShowComments] = useState(false);

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    return formatDistance(parsedDate, new Date(), {
      addSuffix: true,
      locale: fr
    });
  };

  // Vérification plus précise
  if (!tweet) {
    console.error('Tweet manquant');
    return <div>Tweet non disponible</div>;
  }

  // Gérer le cas où l'auteur est undefined
  if (!tweet?.author) {
    console.warn(`⚠️ Tweet sans auteur ! ID: ${tweet.id}`, tweet);
    return <div className="text-red-500">Erreur : ce tweet n'a pas d'auteur.</div>;
  }
  

  return (
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
        <ReactionBar tweetId={tweet.id} />
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
        >
          <span>💬</span>
          <span>Commenter</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          <CommentList tweetId={tweet.id} />
        </div>
      )}
    </article>
  );
}