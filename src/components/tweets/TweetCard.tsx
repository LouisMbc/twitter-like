"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
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
  
  // Helper function to format dates consistently
  const formatDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
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
  };

  // Fonction pour rendre le contenu avec mentions et hashtags
  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@\w+|#\w+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/username/${username}`);
            }}
            className="text-blue-500 hover:text-blue-700 cursor-pointer font-medium"
          >
            {part}
          </span>
        );
      } else if (part.startsWith('#')) {
        const hashtag = part.slice(1);
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/hashtags/${hashtag}`);
            }}
            className="text-red-500 hover:text-red-700 cursor-pointer font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
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
  
  return (
    <div 
      className={`p-4 ${!isComment && 'border-b'} border-gray-800 hover:bg-gray-900/30`}
      onClick={handleClick}
    >
      <div className="flex space-x-3">
        {/* Avatar et info auteur */}
        <div className="flex-shrink-0">
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

        {/* Contenu principal */}
        <div className="flex-1">
          {/* En-tête: nom et date */}
          <div className="flex items-center mb-1">
            <Link 
              href={`/profile/${tweet.author.id}`} 
              className="font-bold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {tweet.author.nickname}
            </Link>
            <span className="text-sm text-gray-500 ml-2">
              {formatDate(tweet.published_at)}
            </span>
          </div>
          
          {/* Contenu du tweet */}
          <div className="mb-3">
            <p className="text-white">{renderContentWithMentions(tweet.content)}</p>
          </div>
          
          {/* Médias du tweet */}
          {tweet.picture && tweet.picture.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {tweet.picture.map((pic, index) => {
                // Améliorer la détection des vidéos
                const isVideo = /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(pic) || pic.includes('video');
                
                return isVideo ? (
                  <div key={index} className="relative aspect-video">
                    <video
                      src={pic}
                      controls
                      playsInline
                      preload="metadata"
                      className="rounded-lg max-h-96 w-full object-cover"
                      onError={(e) => {
                        console.error("Erreur de chargement vidéo:", e);
                        // Fallback: essayer d'afficher comme image
                        const target = e.target as HTMLVideoElement;
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="bg-gray-800 rounded-lg flex items-center justify-center h-full text-gray-400">Vidéo non disponible</div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div key={index} className="relative">
                    <img
                      src={pic}
                      alt="Tweet image"
                      className="rounded-lg max-h-96 w-auto object-cover"
                      onError={(e) => {
                        console.error("Erreur de chargement image:", e);
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.png"; // Optionnel: image de fallback
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Affichage du tweet original s'il s'agit d'un retweet */}
          {tweet.retweet_id && originalTweet && (
            <div className="mt-2 mb-3 border border-gray-700 rounded-lg p-3">
              <div className="mb-2 text-sm text-gray-500 flex items-center">
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                <span>Tweet original de {originalTweet.author.nickname}</span>
              </div>
              
              {/* Tweet original intégré */}
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    {originalTweet.author.profilePicture ? (
                      <img
                        src={originalTweet.author.profilePicture}
                        alt={originalTweet.author.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
                        <span>{originalTweet.author.nickname.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {originalTweet.author.nickname}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {formatDate(originalTweet.published_at)}
                    </p>
                  </div>
                </div>
                
                <p className="text-white text-sm">{renderContentWithMentions(originalTweet.content)}</p>
                
                {originalTweet.picture && originalTweet.picture.length > 0 && (
                  <div className="mt-2">
                    {(() => {
                      const pic = originalTweet.picture[0];
                      const isVideo = /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(pic) || pic.includes('video');
                      
                      return isVideo ? (
                        <video
                          src={pic}
                          controls
                          playsInline
                          preload="metadata"
                          className="rounded-md max-h-64 w-auto"
                        />
                      ) : (
                        <img
                          src={pic}
                          alt="Original tweet image"
                          className="rounded-md max-h-64 w-auto"
                        />
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions (vues, commentaires, retweets) */}
          <div className="flex items-center justify-between mt-2 text-sm">
            <div className="flex items-center space-x-4">
              <div onClick={(e) => e.stopPropagation()}>
                <ViewCount 
                  contentId={tweet.id} 
                  contentType="tweet"
                  initialCount={tweet.view_count || 0}
                />
              </div>
              
              <button 
                onClick={handleCommentClick}
                className="flex items-center text-gray-500 hover:text-blue-500"
              >
                <ChatBubbleOvalLeftIcon className="h-5 w-5 mr-1" />
                <span>{commentCount} Commentaires</span>
              </button>
              
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
        </div>
      </div>
    </div>
  );
}