"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart, MessageSquare, Repeat, BarChart2 } from 'lucide-react';

interface TweetCardProps {
  tweet: {
    id: string;
    content: string;
    created_at: string;
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
    views_count?: number;
    user_id: string;
    profiles?: {
      nickname: string;
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
      id: string;
      verified?: boolean;
    };
    media_url?: string;
  };
  isComment?: boolean;
}

export default function TweetCard({ tweet, isComment = false }: TweetCardProps) {
  const [liked, setLiked] = useState(false);
  
  // Default values for when profiles data is missing
  const profileId = tweet.profiles?.id || tweet.user_id;
  const nickname = tweet.profiles?.nickname || "Utilisateur";
  const profilePicture = tweet.profiles?.profilePicture;
  const firstName = tweet.profiles?.firstName;
  const isVerified = tweet.profiles?.verified || false;
  
  return (
    <div className={`p-4 ${!isComment && 'border-b'} border-gray-800 hover:bg-gray-900/30`}>
      <div className="flex">
        <div className="mr-3 flex-shrink-0">
          <Link href={`/profile/${profileId}`}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={nickname}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">
                {firstName?.[0] || nickname[0]}
              </div>
            )}
          </Link>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <Link href={`/profile/${profileId}`} className="font-bold hover:underline">
              {nickname}
            </Link>
            {isVerified && (
              <span className="ml-1 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
              </span>
            )}
            <span className="mx-1 text-gray-500">•</span>
            <span className="text-gray-500 text-sm">
              {formatDistance(new Date(tweet.created_at), new Date(), { locale: fr })}
            </span>
          </div>
          
          <p className="mt-1 text-white">{tweet.content}</p>
          
          {tweet.media_url && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <img
                src={tweet.media_url}
                alt="Tweet media"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between text-gray-500 max-w-md">
            <button className="flex items-center hover:text-blue-400">
              <MessageSquare size={18} className="mr-1" />
              <span>{tweet.comments_count || 0}</span>
            </button>
            
            <button className="flex items-center hover:text-green-400">
              <Repeat size={18} className="mr-1" />
              <span>{tweet.shares_count || 0}</span>
            </button>
            
            <button 
              className={`flex items-center ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
              onClick={() => setLiked(!liked)}
            >
              <Heart size={18} className="mr-1" fill={liked ? 'currentColor' : 'none'} />
              <span>{(tweet.likes_count || 0) + (liked ? 1 : 0)}</span>
            </button>
            
            <button className="flex items-center hover:text-blue-400">
              <BarChart2 size={18} className="mr-1" />
              <span>{tweet.views_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}