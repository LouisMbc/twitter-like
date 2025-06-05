// src/app/profile/page.tsx
"use client";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import TweetCard from "@/components/tweets/TweetCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { useRef, useCallback } from "react";

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
    loadMoreTweets,
  } = useProfile();

  useAuth();

  // Référence uniquement pour les tweets
  const tweetsObserver = useRef<IntersectionObserver | null>(null);

  // Callback uniquement pour les tweets
  const lastTweetElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (tweetsLoading) return;
      if (tweetsObserver.current) tweetsObserver.current.disconnect();

      tweetsObserver.current = new IntersectionObserver((entries) => {
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
    return (
      <div className="flex justify-center p-8 text-gray-900 dark:text-white">
        Chargement...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center p-8 text-gray-900 dark:text-white">
        Profil non trouvé
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <ProfileHeader
        profile={{
          id: profile.id,
          user_id: profile.user_id,
          firstName: profile.firstName || undefined,
          lastName: profile.lastName || undefined,
          nickname: profile.nickname || "Utilisateur",
          bio: profile.bio || undefined,
          profilePicture: profile.profilePicture || undefined,
          created_at: profile.created_at,
          follower_count: profile.follower_count,
          following_count: profile.following_count,
          certified: false,
          is_premium: false,
          premium_features: [],
        }}
        followersCount={followersCount}
        followingCount={followingCount}
        currentProfileId={currentProfileId}
        isFollowing={false}
        onFollowToggle={() => {}}
      />

      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10 transition-colors duration-300">
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "tweets" ? (
        <div className="space-y-4">
          {tweets.map((tweet, index) => (
            <div
              key={tweet.id}
              className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-950 transition-colors"
            >
              <TweetCard tweet={tweet} />
              {index === tweets.length - 1 && hasTweetsMore && (
                <div ref={lastTweetElementRef} className="h-10"></div>
              )}
            </div>
          ))}
          {tweetsLoading && (
            <div className="flex justify-center p-4">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {console.log("Rendu de", comments.length, "commentaires")}
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-300"
              >
                <div className="flex items-center space-x-2 mb-2">
                  {comment.author?.profilePicture ? (
                    <img
                      src={comment.author.profilePicture}
                      alt={comment.author.nickname}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  )}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comment.author?.nickname || "Utilisateur inconnu"}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {formatDistance(new Date(comment.created_at), new Date(), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="mr-2">👁️ {comment.view_count}</span>
                  <span className="mr-2">
                    💬 Sur{" "}
                    <a
                      href={`/tweets/${comment.tweet_id}`}
                      className="text-red-400 hover:text-red-300 underline"
                    >
                      ce tweet
                    </a>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400">
              Aucun commentaire
            </div>
          )}
          {loading && (
            <div className="flex justify-center p-4">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
