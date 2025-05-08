"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
<<<<<<< HEAD
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
  const lastName = tweet.profiles?.lastName;
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : undefined;
  const isVerified = tweet.profiles?.verified || false;
  
  // Format the date with error handling
  const formattedDate = (() => {
    try {
      // Check if created_at is a valid date string
      const dateObj = new Date(tweet.created_at);
      if (isNaN(dateObj.getTime())) {
        return "récemment";
      }
      return formatDistance(dateObj, new Date(), { locale: fr });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "récemment";
    }
  })();
  
  // Affiche l'ID utilisateur en console pour débogage
  console.log(`Tweet ID: ${tweet.id}, User ID: ${tweet.user_id}, Profile ID: ${profileId}`);
  
=======
import { useRouter } from 'next/navigation';
import { ArrowPathIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline'; // Ajout de l'import
import ReactionBar from '@/components/reactions/ReactionBar';
import ViewCount from '@/components/shared/ViewCount';
import RetweetButton from './RetweetButton';
import { Tweet } from '@/types';
import { useState, useEffect } from 'react';
import { tweetService } from '@/services/supabase/tweet';
import supabase from '@/lib/supabase';

interface TweetCardProps {
  tweet: Tweet;
  detailed?: boolean;
  showRetweetButton?: boolean;
}

export default function TweetCard({ tweet, detailed = false, showRetweetButton = true }: TweetCardProps) {
  const router = useRouter();
  const [originalTweet, setOriginalTweet] = useState<Tweet | null>(null);
  const [commentCount, setCommentCount] = useState(0); // Ajouté pour compter les commentaires

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

>>>>>>> origin/louis
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
              {formattedDate}
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
<<<<<<< HEAD
      </div>
=======
        
        {/* Contenu du tweet courant */}
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

        {/* Affichage du tweet original s'il s'agit d'un retweet */}
        {tweet.retweet_id && originalTweet && (
          <div className="mt-4 border border-gray-200 rounded-lg p-3">
            <div className="mb-2 text-sm text-gray-500 flex items-center">
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              <span>Tweet original de {originalTweet.author.nickname}</span>
            </div>
            
            {/* Tweet original intégré */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                  {originalTweet.author.profilePicture ? (
                    <img
                      src={originalTweet.author.profilePicture}
                      alt={originalTweet.author.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        {originalTweet.author.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {originalTweet.author.nickname}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDate(originalTweet.published_at)}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-800 text-sm">{originalTweet.content}</p>
              
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

        <div className="flex items-center justify-between text-gray-500 mt-4">
          <div className="flex items-center space-x-4">
            <div onClick={(e) => e.stopPropagation()}>
              <ViewCount 
                contentId={tweet.id} 
                contentType="tweet"
                initialCount={tweet.view_count || 0}
              />
            </div>
            
            {/* Bouton Commentaire */}
            <div onClick={(e) => handleCommentClick(e)}>
              <button className="flex items-center text-sm text-gray-500 hover:text-blue-600">
                <ChatBubbleOvalLeftIcon className="h-5 w-5 mr-1" />
                <span>Commenter {commentCount > 0 && `(${commentCount})`}</span>
              </button>
            </div>
            
            {/* Affichage conditionnel du bouton Retweet */}
            {showRetweetButton && (
              <div onClick={(e) => e.stopPropagation()}>
                <RetweetButton tweetId={tweet.id} />
              </div>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <ReactionBar tweetId={tweet.id} />
          </div>
        </div>
      </article>
>>>>>>> origin/louis
    </div>
  );
}