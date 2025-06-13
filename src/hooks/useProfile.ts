"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { Profile } from '@/types/profile';
import { profileService } from '@/services/supabase/profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<Record<string, unknown>[]>([]);
  const [comments, setComments] = useState<Record<string, unknown>[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [tweetPage] = useState(0);
  const [commentPage, setCommentPage] = useState(0);
  const [hasTweetsMore, setHasTweetsMore] = useState(true);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const loadProfileData = async (userId: string) => {
    try {
      setLoading(true);
      setIsInitialized(false);
      
      const { data: profileData } = await profileService.getUserProfile(userId);
      
      if (!profileData) {
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      setProfile(profileData);
      setCurrentProfileId(profileData.id);
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
      
      await Promise.allSettled([
        loadMoreTweets(profileData.id, 0),
        loadAllComments(profileData.id)
      ]);

      setLoading(false);
      setIsInitialized(true);

    } catch {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setIsInitialized(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setProfile(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('id, user_id, nickname, firstName, lastName, bio, profilePicture, created_at, follower_count, following_count, certified, is_premium, premium_features')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profil non trouvé
        }
        throw profileError;
      }

      if (!profileData) {
        setProfile(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      setProfile(profileData);
      setCurrentProfileId(profileData.id);
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
      
      await Promise.allSettled([
        loadMoreTweets(profileData.id, 0),
        loadAllComments(profileData.id)
      ]);
      
      setLoading(false);
      setIsInitialized(true);

    } catch (error) {
      if (error instanceof Error && error.message.includes('auth')) {
        // Erreur d'authentification
      }
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const loadMoreTweets = async (profileId: string, page: number) => {
    try {
      setTweetsLoading(true);
      const { data: tweetsData, error: tweetsError } = await supabase
        .from('Tweets')
        .select(`
          id, content, picture, published_at, view_count, retweet_id, author_id,
          author:author_id (id, nickname, profilePicture)
        `)
        .eq('author_id', profileId)
        .order('published_at', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (tweetsError) throw tweetsError;

      if (page === 0) {
        setTweets(tweetsData || []);
      } else {
        setTweets(prev => [...prev, ...(tweetsData || [])]);
      }

      setHasTweetsMore((tweetsData || []).length === ITEMS_PER_PAGE);
    } catch {
      // Erreur lors du chargement des tweets
    } finally {
      setTweetsLoading(false);
    }
  };

  const loadAllComments = async (profileId: string) => {
    try {
      setCommentsLoading(true);
      const { data: commentsData, error: commentsError } = await supabase
        .from('Comments')
        .select(`
          id, content, created_at, view_count, tweet_id,
          author:Profile!author_id (id, nickname, profilePicture)
        `)
        .eq('author_id', profileId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);
    } catch {
      // Erreur lors du chargement des commentaires
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadMoreComments = async (profileId: string, page: number) => {
    try {
      setCommentsLoading(true);
      setCommentPage(page);
    } catch {
      // Erreur lors du chargement des commentaires
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadMoreTweetsData = useCallback(() => {
    if (!profile || !hasTweetsMore || tweetsLoading) return;
    loadMoreTweets(profile.id, tweetPage + 1);
  }, [profile, hasTweetsMore, tweetsLoading, tweetPage]);

  const loadMoreCommentsData = useCallback(() => {
    if (!profile || commentsLoading) return;
    loadMoreComments(profile.id, commentPage + 1);
  }, [profile, commentsLoading, commentPage]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const incrementFollowingCount = useCallback(() => {
    setFollowingCount(prevCount => prevCount + 1);
  }, []);

  const decrementFollowingCount = useCallback(() => {
    setFollowingCount(prevCount => Math.max(0, prevCount - 1));
  }, []);

  return {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    activeTab,
    setActiveTab,
    loading,
    isInitialized,
    currentProfileId,
    loadProfile,
    loadProfileData,
    loadMoreTweets,
    loadAllComments,
    loadMoreComments,
    loadMoreTweetsData,
    loadMoreCommentsData,
    incrementFollowingCount,
    decrementFollowingCount
  };
};

export default useProfile;


