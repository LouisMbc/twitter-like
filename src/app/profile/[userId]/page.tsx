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
          <div className="animate-pulse flex justify-center">
            <Image
              src="/logo_Flow.png"
              alt="Flow Logo"
              width={120}
              height={40}
              priority
            />
          </div>
          <div className="mt-4">Chargement du profil...</div>
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
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
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
      <div className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto">
          <ProfileHeader
            profile={{
              ...profile,
              username: profile.username || profile.full_name || 'User',
              full_name: profile.full_name || '',
              languages: profile.languages || ((languages) => languages)
            }}
            followersCount={followersCount}
            followingCount={followingCount}
            currentProfileId={currentProfileId}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
            isCurrentUser={isCurrentUser}
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === 'tweets' || tab === 'comments') {
                setActiveTab(tab);
              }
            }}
          />

          <div className="space-y-4">
            {activeTab === 'tweets' ? (
              tweets.length > 0 ? (
                tweets.map(tweet => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">Aucune publication</div>
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
              ) : (
                <div className="p-4 text-center text-gray-500">Aucun commentaire</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}