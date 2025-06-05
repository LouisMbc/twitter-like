// src/app/profile/[userId]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import TweetCard from '@/components/tweets/TweetCard';
import CommentList from '@/components/comments/CommentList';
import Header from '@/components/shared/Header';
import Image from 'next/image';
import { useEffect } from 'react';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  // Vérifier si userId est un ID de profil ou un user_id
  const {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    isFollowing,
    loading,
    currentProfileId,
    handleFollowToggle,
    activeTab,
    setActiveTab
  } = useUserProfile(userId);

  // Function to handle following count changes
  const handleFollowingChange = (change: number) => {
    // This function can remain empty as it's another user's profile
    // The current user's subscription counter is managed by handleFollowToggle
  };

  const isCurrentUser = currentProfileId === profile?.id;
  // Empêcher le scroll quand une story est ouverte
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // Plus besoin de gérer isViewingStories car cette propriété n'existe pas
    return () => {
      body.style.overflow = '';
      html.style.overflow = '';
    };
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-red-500 text-center py-20">Identifiant d'utilisateur manquant</div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">        
        <div className="text-center py-20">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo_Flow.png"
              alt="Flow Logo"
              width={100}
              height={32}
              priority
            />
          </div>
          <div className="text-lg">Chargement du profil...</div>
          <div className="mt-2 text-sm text-gray-400">ID: {userId}</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">        
        <div className="text-center py-20">
          <div className="text-red-500 text-xl mb-4">Profil non trouvé</div>
          <div className="text-gray-400 text-sm mb-4">ID recherché: {userId}</div>
          <button 
            onClick={() => router.push('/explore')} 
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">      
      <Header />
      <div className="ml-64 flex-1">        <div className="w-full bg-black min-h-screen">
          <ProfileHeader
            profile={{
              id: profile.id,
              user_id: profile.user_id,
              nickname: profile.nickname || 'Utilisateur',
              firstName: profile.firstName || undefined,
              lastName: profile.lastName || undefined,
              bio: profile.bio || undefined,
              profilePicture: profile.profilePicture || undefined,
              certified: profile.certified,
              is_premium: profile.is_premium,
              premium_features: profile.premium_features,
              follower_count: profile.follower_count,
              following_count: profile.following_count,
              created_at: profile.created_at
            }}
            followersCount={followersCount}
            followingCount={followingCount}
            currentProfileId={currentProfileId}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
          /><div className="border-b border-gray-800 bg-black sticky top-0 z-10">
            <ProfileTabs
              activeTab={activeTab === 'tweets' || activeTab === 'comments' ? activeTab : 'tweets'}
              onTabChange={(tab) => {
                setActiveTab(tab);
              }}
            />
          </div>

          <div className="bg-black">
            {activeTab === 'tweets' ? (
              tweets.length > 0 ? (
                tweets.map(tweet => (
                  <div key={tweet.id} className="border-b border-gray-800 hover:bg-gray-950 transition-colors">
                    <TweetCard tweet={tweet} />
                  </div>
                ))
              ) : (                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <div className="text-lg font-medium text-white mb-2">Aucune publication</div>
                  <div className="text-sm text-gray-500">{profile.nickname} n'a pas encore publié.</div>
                </div>
              )
            ) : (
              comments.length > 0 ? (
                <CommentList comments={comments.map(comment => ({
                  ...comment,
                  profile_picture: comment.profile_picture || undefined,
                  profiles: {
                    id: comment.id || '',
                    nickname: comment.nickname || '',
                    firstName: comment.first_name || '',
                    lastName: comment.last_name || '',
                    profilePicture: comment.profile_picture || undefined
                  }
                }))} />
              ) : (                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-lg font-medium text-white mb-2">Aucune réponse</div>
                  <div className="text-sm text-gray-500">{profile.nickname} n'a pas encore répondu.</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}