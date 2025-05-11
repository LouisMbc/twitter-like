// src/app/profile/[userId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import TweetCard from '@/components/tweets/TweetCard';
import CommentList from '@/components/comments/CommentList';
import { FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

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
          <div className="mt-4">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex justify-center p-8 text-red-500">Profil non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur-sm p-4 border-b border-gray-800">
          <div className="max-w-2xl mx-auto flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-800 mr-4"
              aria-label="Retour"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold">{profile.full_name || profile.username}</h1>
              <p className="text-sm text-gray-500">{tweets.length} publications</p>
            </div>
          </div>
        </div>

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