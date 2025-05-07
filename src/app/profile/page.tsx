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
import CommentList from '@/components/comments/CommentList';

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
    decrementFollowingCount
  } = useProfile();
  
  useAuth();

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
          {tweets.map(tweet => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      ) : (
        <CommentList comments={comments} />
      )}
    </div>
  );
}