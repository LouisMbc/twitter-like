"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import TweetList from "@/components/tweets/TweetList";
import CommentList from "@/components/comments/CommentList";
import { useParams } from "next/navigation"; 
import { Comment, Tweet } from "@/types";

export default function User() {
  const { userId } = useParams();
  const {
    profile,
    tweets = [] as Tweet[],  // Typage explicite
    comments = [] as Comment[],  // Typage explicite
    followersCount,
    followingCount,
    isFollowing,
    loading,
    activeTab,
    setActiveTab,
  } = useUserProfile(userId as string);

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
        isFollowing={isFollowing}
        onFollowToggle={() => {}}
        currentProfileId={null} 
      />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-4">
        {activeTab === "tweets" ? (
          <TweetList tweets={tweets} />
        ) : (
          <CommentList comments={comments} tweetId={userId as string} />
        )}
      </div>
    </div>
  );
}
