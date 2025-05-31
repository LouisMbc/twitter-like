// src/app/profile/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";
import TweetCard from "@/components/tweets/TweetCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { useRef, useCallback } from "react";
import Image from "next/image";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/shared/Header"; // Import the Header component

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
    loadMoreTweets,
  } = useProfile();

  useAuth();

  // State pour gérer l'onglet actif
  const [activeTab, setActiveTab] = useState<"tweets" | "comments">("tweets");

  // State pour gérer le statut de suivi
  const [isFollowing, setIsFollowing] = useState(false);

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
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // Logique pour suivre/ne plus suivre un utilisateur
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white relative overflow-hidden">
        {/* Enhanced Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-blue-900/10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/8 to-indigo-500/8 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8">
            <div className="relative group">
              <div className="absolute -inset-8 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-2xl opacity-75 animate-pulse"></div>
              <div className="relative">
                <Image
                  src="/logo_Flow.png"
                  alt="Flow Logo"
                  width={160}
                  height={50}
                  priority
                  className="relative z-10 drop-shadow-2xl animate-pulse"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Chargement de votre profil...
              </div>
              <div className="text-gray-400">Veuillez patienter un instant</div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-red-400 rounded-full animate-spin animate-reverse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white relative overflow-hidden">
        {/* Enhanced Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-blue-900/10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="max-w-lg mx-auto p-8">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-75"></div>
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-gray-700/50 text-center">
                <div className="relative group mb-8">
                  <div className="absolute -inset-4 bg-gradient-to-r from-gray-500/20 to-gray-400/20 rounded-full blur-xl opacity-50"></div>
                  <svg
                    className="relative w-20 h-20 mx-auto text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-1.048-5.966-2.709M2.5 17.5L7.5 12.5l-2-2-2.5 2.5z"
                    />
                  </svg>
                </div>

                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Profil non trouvé
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Ce profil n'existe pas ou a été supprimé. Il se peut qu'il ait
                  été déplacé ou que vous n'ayez pas les permissions
                  nécessaires.
                </p>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span>Retour à l'accueil</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen flex bg-black text-gray-100 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-800/6 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-700/4 rounded-full blur-3xl"></div>

      <Header />

      {/* Main content */}
      <div className="ml-64 flex-1 relative z-10">
        {/* Content area */}
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="relative group">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/40 overflow-hidden">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>

              <div className="relative z-10">
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
                  isFollowing={isFollowing}
                  onFollowToggle={handleFollowToggle}
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative group">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>

              <div className="relative z-10">
                <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="p-8">                  {activeTab === "tweets" ? (
                    <div className="space-y-6">
                      {tweets.length > 0 ? (
                        tweets.map((tweet, index) => (
                          <div key={tweet.id} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700/15 to-gray-600/15 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
                              <TweetCard tweet={tweet} />
                              {index === tweets.length - 1 && hasTweetsMore && (
                                <div
                                  ref={lastTweetElementRef}
                                  className="h-10"
                                ></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16">
                          <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-gray-600/20 to-gray-400/20 rounded-full blur-xl opacity-50"></div>
                            <svg
                              className="relative w-20 h-20 mx-auto text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text mb-3">
                            Aucun tweet
                          </h3>
                          <p className="text-gray-400 text-lg">
                            Commencez à partager vos pensées !
                          </p>
                        </div>
                      )}
                      {tweetsLoading && (
                        <div className="flex justify-center p-8">
                          <div className="relative">
                            <div className="w-12 h-12 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-red-400 rounded-full animate-spin animate-reverse"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700/15 to-gray-600/15 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
                              <div className="flex items-center space-x-4 mb-4">
                                {comment.author?.profilePicture ? (
                                  <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur opacity-75"></div>
                                    <img
                                      src={comment.author.profilePicture}
                                      alt={comment.author.nickname}
                                      className="relative w-12 h-12 rounded-full ring-2 ring-gray-600"
                                    />
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full blur opacity-75"></div>
                                    <div className="relative w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                                      <span className="text-white font-semibold text-lg">
                                        {comment.author?.nickname
                                          ?.charAt(0)
                                          .toUpperCase() || "?"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-white text-lg">
                                    {comment.author?.nickname ||
                                      "Utilisateur inconnu"}
                                  </span>
                                  <div className="text-sm text-gray-400">
                                    {formatDistance(
                                      new Date(comment.created_at),
                                      new Date(),
                                      {
                                        addSuffix: true,
                                        locale: fr,
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-200 leading-relaxed mb-4 text-lg">
                                {comment.content}
                              </p>
                              <div className="flex items-center text-sm text-gray-400 space-x-6">
                                <span className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                                  <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>{comment.view_count}</span>
                                </span>
                                <span className="flex items-center space-x-2">
                                  <span>💬 Sur</span>
                                  <a
                                    href={`/tweets/${comment.tweet_id}`}
                                    className="text-red-400 hover:text-red-300 underline decoration-2 underline-offset-2 transition-colors"
                                  >
                                    ce tweet
                                  </a>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16">
                          <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-gray-600/20 to-gray-400/20 rounded-full blur-xl opacity-50"></div>
                            <svg
                              className="relative w-20 h-20 mx-auto text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text mb-3">
                            Aucun commentaire
                          </h3>
                          <p className="text-gray-400 text-lg">
                            Participez aux conversations !
                          </p>
                        </div>
                      )}
                      {loading && (
                        <div className="flex justify-center p-8">
                          <div className="relative">
                            <div className="w-12 h-12 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-red-400 rounded-full animate-spin animate-reverse"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
