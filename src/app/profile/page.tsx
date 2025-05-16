// src/app/profile/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import TweetCard from '@/components/tweets/TweetCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { useRef, useCallback } from 'react';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from '@/components/shared/Header'; // Import the Header component

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    loading,
    currentProfileId,
    tweetsLoading,
    hasTweetsMore,
    loadMoreTweets
  } = useProfile();
  
  useAuth();

  // State pour gérer l'onglet actif
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  
  // State pour gérer le statut de suivi
  const [isFollowing, setIsFollowing] = useState(false);

  // Référence uniquement pour les tweets
  const tweetsObserver = useRef<IntersectionObserver | null>(null);
  
  // Callback uniquement pour les tweets
  const lastTweetElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (tweetsLoading) return;
      if (tweetsObserver.current) tweetsObserver.current.disconnect();
      
      tweetsObserver.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasTweetsMore) {
          loadMoreTweets();
        }
      });
      
      if (node) tweetsObserver.current.observe(node);
    },
    [tweetsLoading, hasTweetsMore, loadMoreTweets]
  );

  // Fonction pour gérer le changement du nombre d'abonnements
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // Logique pour suivre/ne plus suivre un utilisateur
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-center py-20">
          <div className="animate-pulse flex justify-center">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={120} 
              height={40} 
              priority
            />
          </div>
          <div className="mt-4">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Profil non trouvé</h2>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      <Header />
      
      <div className="ml-64 flex-1">
        <div className="max-w-xl mx-auto">
          <ProfileHeader 
            profile={{
              ...profile,
              certified: false,
              is_premium: false,
              premium_features: []
            }}
            followersCount={followersCount}
            followingCount={followingCount}
            currentProfileId={currentProfileId}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
          />
          
          <ProfileTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === 'tweets' ? (
            <div className="space-y-4">
              {tweets.map((tweet, index) => (
                <div key={tweet.id}>
                  <TweetCard tweet={tweet} />
                  {index === tweets.length - 1 && hasTweetsMore && (
                    <div ref={lastTweetElementRef} className="h-10"></div>
                  )}
                </div>
              ))}
              {tweetsLoading && (
                <div className="flex justify-center p-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {comment.author?.profilePicture ? (
                        <img
                          src={comment.author.profilePicture}
                          alt={comment.author.nickname}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      )}
                      <span className="font-semibold">{comment.author?.nickname || 'Utilisateur inconnu'}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {formatDistance(new Date(comment.created_at), new Date(), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span className="mr-2">
                        👁️ {comment.view_count}
                      </span>
                      <span className="mr-2">
                        💬 Sur <a href={`/tweets/${comment.tweet_id}`} className="text-blue-500 hover:underline">ce tweet</a>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-500">
                  Aucun commentaire
                </div>
              )}
              {loading && (
                <div className="flex justify-center p-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}