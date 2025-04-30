"use client";

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import ReactionBar from '@/components/reactions/ReactionBar';
import ViewCount from '@/components/shared/ViewCount';
import TweetActions from './TweetActions'; // Add this import
import { Tweet } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import useTranslation from '@/hooks/useTranslation';
import { TranslatedContent } from '@/types/language';

// Define supported languages if not defined elsewhere
const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  // Add other languages as needed
];

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

  useEffect(() => {
    async function translateTweet() {
      setIsLoading(true);
      const result = await translateContent(tweet.content);
      setTranslation(result);
      setIsLoading(false);
    }
    
    translateTweet();
  }, [tweet.content, translateContent]);

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOriginal(!showOriginal);
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

        <div className="mb-4">
          {isLoading ? (
            <p className="text-gray-400">Translating...</p>
          ) : (
            <>
              <p className="text-gray-800">
                {showOriginal ? tweet.content : translation?.translatedContent}
              </p>
              
              {translation && translation.translatedLanguage && (
                <div className="mt-2 text-sm text-gray-500 flex items-center">
                  {!showOriginal && (
                    <span>Translated to: {
                      supportedLanguages.find(l => l.code === translation.translatedLanguage)?.name || 
                      translation.translatedLanguage
                    }</span>
                  )}
                  <button 
                    onClick={toggleLanguage} 
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    {showOriginal ? 'Show translation' : 'Show original'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

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
          <div onClick={(e) => e.stopPropagation()}>
            <ViewCount 
              contentId={tweet.id} 
              contentType="tweet"
              initialCount={tweet.view_count || 0}
            />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <ReactionBar tweetId={tweet.id} />
          </div>
          
          <TweetActions tweetId={tweet.id} />
        </div>
      </article>
    </div>
  );
}