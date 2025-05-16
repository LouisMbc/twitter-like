// src/app/profile/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import TweetCard from '@/components/tweets/TweetCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { useRef, useCallback } from 'react';

export default function ProfilePage() {
  const {
    profile,
    tweets,
    comments,
    activeTab,
    setActiveTab,
    followersCount,
    followingCount,
    loading,
    currentProfileId,
    incrementFollowingCount,
    decrementFollowingCount,
    // Garder uniquement les props pour les tweets
    tweetsLoading,
    hasTweetsMore,
    loadMoreTweets
  } = useProfile();
  
  useAuth();

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
  const handleFollowingChange = (change: number) => {
    if (change > 0) {
      incrementFollowingCount();
    } else {
      decrementFollowingCount();
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center p-8">Profil non trouvé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader 
        profile={profile}
        followersCount={followersCount}
        followingCount={followingCount}
        currentProfileId={currentProfileId}
        isFollowing={false}
        onFollowToggle={() => {}}
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
          {console.log('Rendu de', comments.length, 'commentaires')}
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
  );
}