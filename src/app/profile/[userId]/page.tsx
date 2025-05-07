// src/app/profile/[userId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile'; // Assurez-vous que ce hook existe
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import TweetCard from '@/components/tweets/TweetCard';
import CommentList from '@/components/comments/CommentList';

export default function UserProfilePage() {
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

  // Fonction pour gérer le changement du nombre d'abonnements
  const handleFollowingChange = (change: number) => {
    // Cette fonction peut rester vide car c'est le profil d'un autre utilisateur
    // Le compteur d'abonnements de l'utilisateur courant est géré par handleFollowToggle
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center p-8 text-red-500">Profil non trouvé</div>;
  }

  const isCurrentUser = currentProfileId === profile.id;

  return (
    <div className="max-w-4xl mx-auto p-4 mt-20">
      <ProfileHeader 
        profile={profile}
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

      <div className="space-y-4">
        {activeTab === 'tweets' ? (
          tweets.map(tweet => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))
        ) : (
          <CommentList comments={comments} />
        )}
      </div>
    </div>
  );
}