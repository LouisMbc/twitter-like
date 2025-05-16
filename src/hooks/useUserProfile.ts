"use client";

<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile } from '@/types/profile';
=======
export const useUserProfile = (userID: string) => {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  
  const {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    isFollowing,
    loading,
    currentProfileId,
    handleFollowToggle
  } = useProfileData(params.userId as string);
>>>>>>> origin/louis

export function useUserProfile(userId: string) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments' | 'media' | 'likes'>('tweets');

  // Fonction pour charger les données du profil utilisateur
  const loadUserProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Get target profile
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get current user's profile
      const { data: currentProfile, error: currentProfileError } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (currentProfileError) throw currentProfileError;
      setCurrentProfileId(currentProfile.id);

      // Get followers count
      const { count: followers, error: followersError } = await supabase
        .from('Following')
        .select('*', { count: 'exact' })
        .eq('following_id', userId);

      if (followersError) throw followersError;
      setFollowersCount(followers || 0);

      // Get following count
      const { count: following, error: followingError } = await supabase
        .from('Following')
        .select('*', { count: 'exact' })
        .eq('follower_id', userId);

      if (followingError) throw followingError;
      setFollowingCount(following || 0);

      // Check if current user follows target profile
      if (currentProfile.id !== userId) {
        const { data: followData, error: followError } = await supabase
          .from('Following')
          .select('*')
          .eq('follower_id', currentProfile.id)
          .eq('following_id', userId)
          .maybeSingle();

        if (followError && followError.code !== 'PGRST116') throw followError;
        setIsFollowing(!!followData);
      }

      // Get tweets
      const { data: tweetsData, error: tweetsError } = await supabase
        .from('Tweets')
        .select('*, author:Profile!author_id(*)')
        .eq('author_id', userId)
        .order('published_at', { ascending: false });

      if (tweetsError) throw tweetsError;
      setTweets(tweetsData || []);

      // Get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('Comments')
        .select('*, tweet:Tweets(*), author:Profile(*)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      setProfile(profileData);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    try {
      if (!currentProfileId) return;

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('Following')
          .delete()
          .eq('follower_id', currentProfileId)
          .eq('following_id', userId);

        if (error) throw error;
        setFollowersCount(prev => prev - 1);
      } else {
        // Follow
        const { error } = await supabase
          .from('Following')
          .insert([
            { follower_id: currentProfileId, following_id: userId }
          ]);

        if (error) throw error;
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Load data on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadUserProfileData();
    }
  }, [userId, loadUserProfileData]);

  return {
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
  };
}