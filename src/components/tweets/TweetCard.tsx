"use client";

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import ReactionBar from '@/components/reactions/ReactionBar';
import ViewCount from '@/components/shared/ViewCount';
import TweetActions from './TweetActions';
import { Tweet } from '@/types';
import useProfile from '@/hooks/useProfile';
import { TranslatedContent } from '@/types/language';

function useTranslation() {
  const translateContent = async (content: string): Promise<TranslatedContent> => {
    return {
      originalContent: content,
      translatedContent: content,
      detectedLanguage: 'fr',
      translatedLanguage: 'en'
    };
  };

  return { translateContent };
}

interface TweetCardProps {
  tweet: Tweet;
  detailed?: boolean;
}

export default function TweetCard({ tweet, detailed = false }: TweetCardProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const { translateContent } = useTranslation();
  const [translation, setTranslation] = useState<TranslatedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showOriginal, setShowOriginal] = useState<boolean>(true);

  useEffect(() => {
    async function translateTweet() {
      setIsLoading(true);
      const result = await translateContent(tweet.content);
      setTranslation(result);
      setIsLoading(false);
    }
    
    translateTweet();
  }, [tweet.content, translateContent]);

  const handleClick = () => {
    if (!detailed) {
      router.push(`/tweets/${tweet.id}`);
    }
  };

  const formatDate = (date: string) => {
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      locale: fr
    });
  };

  if (!tweet?.author) {
    return <div className="text-red-500">Erreur : ce tweet n'a pas d'auteur.</div>;
  }

  return (
    <div 
      onClick={handleClick}
      className={`border-b border-gray-200 p-4 ${!detailed && 'cursor-pointer hover:bg-gray-50'}`}
    >
      <div className="flex">
        <div className="mr-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {tweet.author.profilePicture ? (
              <img
                src={tweet.author.profilePicture}
                alt={tweet.author.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm text-gray-500">
                  {tweet.author.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="font-bold mr-1">{tweet.author.nickname}</span>
            <span className="text-gray-500 text-sm">@{tweet.author.nickname.toLowerCase()}</span>
            <span className="mx-1 text-gray-500">•</span>
            <span className="text-gray-500 text-sm">{formatDate(tweet.published_at || tweet.created_at)}</span>
          </div>
          
          <p className="text-gray-900 mb-2">
            {tweet.content}
          </p>
          
          {tweet.picture && tweet.picture.length > 0 && (
            <div className="mt-2 mb-3 rounded-lg overflow-hidden">
              <img
                src={tweet.picture[0]}
                alt="Tweet image"
                className="w-full h-auto max-h-80 object-cover"
              />
            </div>
          )}
          
          <div className="flex justify-between mt-2 text-gray-500 text-sm">
            <button className="flex items-center hover:text-blue-500" onClick={(e) => e.stopPropagation()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{tweet.comments_count || 0}</span>
            </button>
            
            <div onClick={(e) => e.stopPropagation()} className="flex items-center">
              <ReactionBar tweetId={tweet.id} />
            </div>
            
            <ViewCount 
              contentId={tweet.id} 
              contentType="tweet"
              initialCount={tweet.view_count || 0}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}