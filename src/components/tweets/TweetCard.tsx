"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare, Repeat, BarChart2 } from 'lucide-react';
import { ArrowPathIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import ReactionBar from '@/components/reactions/ReactionBar';
import ViewCount from '@/components/shared/ViewCount';
import RetweetButton from './RetweetButton';
import { Tweet } from '@/types';
import { tweetService } from '@/services/supabase/tweet';
import supabase from '@/lib/supabase';

interface TweetCardProps {
  tweet: Tweet;
  detailed?: boolean;
  showRetweetButton?: boolean;
  isComment?: boolean;
}

export default function TweetCard({ tweet, detailed = false, showRetweetButton = true, isComment = false }: TweetCardProps) {
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const [originalTweet, setOriginalTweet] = useState<Tweet | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  // Récupérer le tweet original si c'est un retweet
  useEffect(() => {
    const fetchOriginalTweet = async () => {
      if (tweet.retweet_id) {
        const { data } = await tweetService.getTweetById(tweet.retweet_id);
        if (data) {
          setOriginalTweet(data);
        }
      }
    };

    fetchOriginalTweet();
  }, [tweet.retweet_id]);

  // Récupérer le nombre de commentaires
  useEffect(() => {
    const fetchCommentCount = async () => {
      const { count } = await supabase
        .from('Comments')
        .select('*', { count: 'exact', head: true })
        .eq('tweet_id', tweet.id);
      
      setCommentCount(count || 0);
    };

    fetchCommentCount();
  }, [tweet.id]);

  // Format the date with error handling
  const formattedDate = (() => {
    try {
      // Check if created_at is a valid date string
      const dateObj = new Date(tweet.published_at);
      if (isNaN(dateObj.getTime())) {
        return "récemment";
      }
      return formatDistance(dateObj, new Date(), { 
        addSuffix: true,
        locale: fr 
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "récemment";
    }
  })();

  const handleClick = () => {
    if (!detailed) {
      router.push(`/tweets/${tweet.id}`);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/tweets/${tweet.id}#comments`);
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
    <div className={`p-4 ${!isComment && 'border-b'} border-gray-800 hover:bg-gray-900/30`}
         onClick={handleClick}>
      <div className="flex">
        <div className="mr-3 flex-shrink-0">
          <Link href={`/profile/${tweet.author.id}`} onClick={(e) => e.stopPropagation()}>
            {tweet.author.profilePicture ? (
              <img
                src={tweet.author.profilePicture}
                alt={tweet.author.nickname}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">
                {tweet.author.nickname[0]}
              </div>
            )}
          </Link>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <Link href={`/profile/${tweet.author.id}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
              {tweet.author.nickname}
            </Link>
            {tweet.author.verified && (
              <span className="ml-1 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
              </span>
            )}
            <span className="mx-1 text-gray-500">•</span>
            <span className="text-gray-500 text-sm">
              {formattedDate}
            </span>
          </div>
          
          <p className="mt-1 text-white">{tweet.content}</p>
          
          {tweet.picture && tweet.picture.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <img
                src={tweet.picture[0]}
                alt="Tweet media"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          {/* Affichage du tweet original s'il s'agit d'un retweet */}
          {tweet.retweet_id && originalTweet && (
            <div className="mt-4 border border-gray-700 rounded-lg p-3">
              <div className="mb-2 text-sm text-gray-400 flex items-center">
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                <span>Tweet original de {originalTweet.author.nickname}</span>
              </div>
              
              {/* Tweet original intégré */}
              <div className="bg-gray-900 p-3 rounded-md">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    {originalTweet.author.profilePicture ? (
                      <img
                        src={originalTweet.author.profilePicture}
                        alt={originalTweet.author.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-sm text-gray-300">
                          {originalTweet.author.nickname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {originalTweet.author.nickname}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {formatDistance(new Date(originalTweet.published_at), new Date(), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </p>
                  </div>
                </div>
                
                <p className="text-white text-sm">{originalTweet.content}</p>
                
                {originalTweet.picture && originalTweet.picture.length > 0 && (
                  <div className="mt-2">
                    <img
                      src={originalTweet.picture[0]}
                      alt="Original tweet image"
                      className="rounded-md max-h-64 w-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between text-gray-500 max-w-md">
            <button className="flex items-center hover:text-blue-400" onClick={(e) => handleCommentClick(e)}>
              <MessageSquare size={18} className="mr-1" />
              <span>{commentCount}</span>
            </button>
            
            <div onClick={(e) => e.stopPropagation()}>
              {showRetweetButton && <RetweetButton tweetId={tweet.id} />}
            </div>
            
            <div onClick={(e) => e.stopPropagation()}>
              <ReactionBar tweetId={tweet.id} />
            </div>
            
            <div onClick={(e) => e.stopPropagation()}>
              <ViewCount 
                contentId={tweet.id} 
                contentType="tweet"
                initialCount={tweet.view_count || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}