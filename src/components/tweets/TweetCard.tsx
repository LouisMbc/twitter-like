"use client";

import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline'; 
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

  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(#\w+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const hashtagName = part.slice(1);
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/hashtags/${hashtagName}`);
            }}
            className="text-blue-500 hover:text-blue-700 cursor-pointer font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
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
        
        {/* Contenu du tweet courant */}
        <p className="text-gray-800 mb-4">
          {renderContentWithHashtags(tweet.content)}
        </p>

        {tweet.picture && tweet.picture.length > 0 && (
          <div className="mb-4">
            {tweet.picture.map((pic, index) => {
              // Déterminer si c'est une vidéo en vérifiant l'extension de l'URL
              const isVideo = /\.(mp4|webm|ogg)$/i.test(pic);
              
              return isVideo ? (
                <div key={index} className="relative aspect-video">
                  <video
                    src={pic}
                    controls
                    playsInline
                    className="rounded-lg max-h-96 w-auto"
                    onError={(e) => console.error("Erreur de chargement vidéo:", e)}
                  />
                </div>
              ) : (
                <div key={index} className="relative">
                  <img
                    src={pic}
                    alt="Tweet image"
                    className="rounded-lg max-h-96 w-auto"
                  />
                </div>
              );
            })}
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
              
              <p className="text-gray-800 text-sm">
                {renderContentWithHashtags(originalTweet.content)}
              </p>
              
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
    </div>
  );
}