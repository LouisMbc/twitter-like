import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile, Tweet, Comment } from '@/types';
import { profileService } from '@/services/supabase/profile';
import { useAuth } from '@/hooks/useAuth';

export const useProfile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  const loadProfileData = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await profileService.getUserProfile(userId);
      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        setFollowersCount(profileData.follower_count || 0);
        setFollowingCount(profileData.following_count || 0);

        const { data: tweets } = await profileService.getUserTweets(profileData.id);
        const { data: comments } = await profileService.getUserComments(profileData.id);

        setTweets(tweets || []);
        setComments(comments || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await profileService.getProfile(session.user.id);
      if (profileError) throw profileError;

      if (!profileData) {
        router.push('/profile/setup');
        return;
      }

      setProfile(profileData);
      setCurrentProfileId(profileData.id);

      // Charger les tweets et commentaires
      const { data: tweetsData } = await profileService.getUserTweets(profileData.id);
      const { data: commentsData } = await profileService.getUserComments(profileData.id);

      setTweets(tweetsData || []);
      setComments(commentsData || []);
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    tweets,
    comments,
    activeTab,
    setActiveTab,
    followersCount,
    followingCount,
    loading,
    currentProfileId // Ajout de currentProfileId
  };
};