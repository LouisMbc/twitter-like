import { useState, useEffect } from "react";
import { Comment } from "@/types";
import { fetchUserProfile, fetchUserTweets, fetchUserComments } from "@/services/supabase/api";

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tweets" | "comments">("tweets");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const profileData = await fetchUserProfile(userId);
        const tweetsData = await fetchUserTweets(userId);
        const commentsData = await fetchUserComments(userId);

        setProfile(profileData);
        setTweets(tweetsData);
        setComments(commentsData as Comment[]);
        setFollowersCount(profileData.followersCount);
        setFollowingCount(profileData.followingCount);
        setIsFollowing(profileData.isFollowing);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  function handleFollowToggle() {
    setIsFollowing((prev) => !prev);
  }

  return {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    isFollowing,
    loading,
    handleFollowToggle,
    activeTab,
    setActiveTab,
  };
}
