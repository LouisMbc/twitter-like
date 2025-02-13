"use client";

import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import TweetList from '@/components/tweets/TweetList';
import CommentList from '@/components/comments/CommentList';

export default function UserProfilePage() {
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
  } = useUserProfile();

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center p-8 text-red-500">Profil non trouvé</div>;
  }

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
          <TweetList tweets={tweets} />
        ) : (
          <CommentList comments={comments} />
        )}
      </div>
    </div>
  );
}