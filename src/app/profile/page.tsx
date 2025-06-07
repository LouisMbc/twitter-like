"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import TweetCard from "@/components/tweets/TweetCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { useRef, useCallback } from "react";
import Image from "next/image";
import Header from "@/components/shared/Header";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import supabase from "@/lib/supabase";

interface Tweet {
  id: string;
  content: string;
  picture?: string[];
  published_at: string;
  view_count: number;
  retweet_id?: string;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    tweets,
    comments,
    loading,
    followersCount,
    followingCount,
    loadProfile,
  } = useProfile();

  const [mediaTweets, setMediaTweets] = useState<Tweet[]>([]);
  const [likedTweets, setLikedTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (tweets.length > 0) {
      // Filtrer les tweets avec médias
      const tweetsWithMedia = tweets.filter(
        (tweet) => tweet.picture && tweet.picture.length > 0
      );
      setMediaTweets(tweetsWithMedia);
    }

    if (profile?.id) {
      // Charger les tweets likés
      const loadLikedTweets = async () => {
        const { data: likedTweetsData, error } = await supabase
          .from("Likes")
          .select(`
            tweet:tweet_id (
              id,
              content,
              picture,
              published_at,
              view_count,
              retweet_id,
              author:Profile!author_id (id, nickname, profilePicture)
            )
          `)
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false });

        if (!error && likedTweetsData) {
          const cleanedLikedTweets = likedTweetsData
            .filter((like) => like.tweet)
            .map((like) => ({
              ...like.tweet,
              author: like.tweet.author
                ? {
                    ...like.tweet.author,
                    nickname: like.tweet.author.nickname || "",
                  }
                : null,
            }));
          setLikedTweets(cleanedLikedTweets);
        }
      };

      loadLikedTweets();
    }
  }, [tweets, profile?.id]);

  // State pour gérer le statut de suivi
  const [isFollowing, setIsFollowing] = useState(false);

  // State pour gérer le chargement initial
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Référence uniquement pour les tweets
  const tweetsObserver = useRef<IntersectionObserver | null>(null);

  // Callback uniquement pour les tweets
  const lastTweetElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (tweetsObserver.current) tweetsObserver.current.disconnect();

      tweetsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && tweets.length > 0) {
          loadMoreTweets(currentProfileId || "", 1);
        }
      });

      if (node) tweetsObserver.current.observe(node);
    },
    [loading, tweets.length, loadMoreTweets, currentProfileId]
  );

  // Fonction pour gérer le changement du nombre d'abonnements
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // Logique pour suivre/ne plus suivre un utilisateur
  };

  // Effet pour gérer le chargement initial
  useEffect(() => {
    if (!loading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, isInitialLoad]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md mx-auto p-8 text-center">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-4">Profil non trouvé</h2>
              <p className="text-gray-400 mb-6">
                Ce profil n'existe pas ou a été supprimé.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      <Header />

      {/* Main content - fixed positioning to prevent layout shifts */}
      <div className="ml-64 flex-1 relative">
        <div className="w-full bg-white dark:bg-black min-h-screen transition-colors duration-300">
          {/* Profile Section - Full Width */}
          <div className="w-full">
            <ProfileHeader
              profile={{
                id: profile.id,
                user_id: profile.user_id,
                firstName: profile.firstName || null,
                lastName: profile.lastName || null,
                nickname: profile.nickname || "Utilisateur",
                bio: profile.bio || null,
                profilePicture: profile.profilePicture || null,
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
              isFollowing={isFollowing}
              onFollowToggle={handleFollowToggle}
            />
          </div>

          {/* Tabs and Content - Full Width */}
          <div className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10 transition-colors duration-300">
            <div className="w-full">
              <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tweets={tweets}
                comments={comments}
                mediaTweets={mediaTweets}
                likedTweets={likedTweets}
                loading={loading}
              />
            </div>
          </div>

          <div className="w-full bg-white dark:bg-black min-h-screen transition-colors duration-300">
            {activeTab === "tweets" ? (
              <div className="w-full">
                {tweets.length > 0 ? (
                  tweets.map((tweet, index) => (
                    <div
                      key={tweet.id}
                      className="w-full border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-950 transition-colors"
                    >
                      <TweetCard tweet={tweet} />
                      {index === tweets.length - 1 && (
                        <div ref={lastTweetElementRef} className="h-1"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-16 px-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Aucun post publié
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Quand vous publierez des posts, ils apparaîtront ici.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="w-full border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-100 dark:hover:bg-gray-950 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        {comment.author?.profilePicture ? (
                          <img
                            src={comment.author.profilePicture}
                            alt={comment.author.nickname || "Utilisateur"}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}

                        <div
                          className={`w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center ${
                            comment.author?.profilePicture ? "hidden" : ""
                          }`}
                        >
                          <span className="text-gray-900 dark:text-white font-medium text-sm">
                            {comment.author?.nickname?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {comment.author?.nickname || "Utilisateur inconnu"}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {comment.created_at ? (
                                formatDistance(
                                  new Date(comment.created_at),
                                  new Date(),
                                  {
                                    addSuffix: true,
                                    locale: fr,
                                  }
                                )
                              ) : (
                                "Date inconnue"
                              )}
                            </span>
                          </div>

                          <p className="text-gray-700 dark:text-gray-300 mb-3">
                            {comment.content || "Contenu non disponible"}
                          </p>

                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center space-x-1">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{comment.view_count || 0}</span>
                            </span>
                            {comment.tweet_id && (
                              <span>
                                💬 Sur{" "}
                                <a
                                  href={`/tweets/${comment.tweet_id}`}
                                  className="text-red-400 hover:text-red-300 underline"
                                >
                                  ce tweet
                                </a>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-16 px-8">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      Aucune réponse
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Quand vous répondrez aux posts, vos réponses apparaîtront ici.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}