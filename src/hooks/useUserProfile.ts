"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile } from '@/types/profile';

interface TweetData {
  id: string;
  content: string;
  picture?: string;
  published_at: string;
  view_count: number;
  retweet_id?: string;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string;
  } | null;
}

interface CommentData {
  id: string;
  content: string;
  created_at: string;
  view_count: number;
  parent_comment_id?: string;
  tweet: {
    id: string;
    content: string;
  } | null;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string;
  } | null;
}

interface LikeData {
  tweet: TweetData;
}

export function useUserProfile(userId: string) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<TweetData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [mediaTweets, setMediaTweets] = useState<TweetData[]>([]);
  const [likedTweets, setLikedTweets] = useState<TweetData[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');

  // Fonction pour charger les données du profil utilisateur
  const loadUserProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: currentUserProfile } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (currentUserProfile) {
        setCurrentProfileId(currentUserProfile.id);
      }

      let profileData = null;
      
      const { data: profileById } = await supabase
        .from('Profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileById) {
        profileData = profileById;
      } else {
        const { data: profileByUserId } = await supabase
          .from('Profile')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileByUserId) {
          profileData = profileByUserId;
        } else {
          setLoading(false);
          return;
        }
      }

      // Conserver le nickname tel quel pour le stockage, mais l'afficher avec @
      setProfile(profileData);

      const [followersResult, followingResult, isFollowingResult] = await Promise.all([
        supabase
          .from('Following')
          .select('*', { count: 'exact' })
          .eq('following_id', profileData.id),
        supabase
          .from('Following')
          .select('*', { count: 'exact' })
          .eq('follower_id', profileData.id),
        currentUserProfile ? supabase
          .from('Following')
          .select('*')
          .eq('follower_id', currentUserProfile.id)
          .eq('following_id', profileData.id)
          .maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      setFollowersCount(followersResult.count || 0);
      setFollowingCount(followingResult.count || 0);
      setIsFollowing(!!isFollowingResult.data);

      // Charger tous les tweets
      const { data: tweetsData } = await supabase
        .from('Tweets')
        .select(`
          id,
          content,
          picture,
          published_at,
          view_count,
          retweet_id,
          author:Profile!author_id (id, nickname, profilePicture)
        `)
        .eq('author_id', profileData.id)
        .order('published_at', { ascending: false });

      if (tweetsData) {
        const cleanedTweets = tweetsData.map(tweet => {
          const authorData = tweet.author as Profile | Profile[];
          return {
            ...tweet,
            author: authorData ? {
              ...Array.isArray(authorData) ? authorData[0] : authorData,
              nickname: (Array.isArray(authorData) ? authorData[0]?.nickname : authorData?.nickname) || ''
            } : null
          };
        });
        setTweets(cleanedTweets);

        // Filtrer les tweets avec médias - EXCLURE les retweets
        const tweetsWithMedia = cleanedTweets.filter(tweet => 
          tweet.picture && 
          tweet.picture.length > 0 && 
          !tweet.retweet_id  // Exclure les retweets
        );
        setMediaTweets(tweetsWithMedia);
      }

      // Charger les tweets likés
      const { data: likedTweetsData } = await supabase
        .from('Likes')
        .select(`
          tweet:tweet_id (
            id,
            content,
            picture,
            published_at,
            view_count,
            retweet_id,
            author:Profile!author_id (id, nickname, profilePicture)
          )
        `)
        .eq('profile_id', profileData.id)
        .order('created_at', { ascending: false });

      if (likedTweetsData) {
        const cleanedLikedTweets = likedTweetsData
          .filter((like: LikeData) => like.tweet)
          .map((like: LikeData) => {
            const tweet = like.tweet;
            return {
              ...tweet,
              author: tweet.author ? {
                ...Array.isArray(tweet.author) ? tweet.author[0] : tweet.author,
                nickname: (Array.isArray(tweet.author) ? tweet.author[0]?.nickname : tweet.author?.nickname) || ''
              } : null
            };
          });
        setLikedTweets(cleanedLikedTweets);
      }

      const { data: commentsData } = await supabase
        .from('Comments')
        .select(`
          id,
          content,
          created_at,
          view_count,
          parent_comment_id,
          tweet:tweet_id ( id, content ),
          author:author_id (
            id,
            nickname,
            profilePicture
          )
        `)
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false });

      if (commentsData) {
        const cleanedComments = commentsData.map(comment => {
          const author = comment.author as Profile | Profile[];
          return {
            ...comment,
            author: author ? {
              ...Array.isArray(author) ? author[0] : author,
              nickname: (Array.isArray(author) ? author[0]?.nickname : author?.nickname) || ''
            } : null
          };
        });
        setComments(cleanedComments);
      }

    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  // Fonction pour gérer le follow/unfollow
  const handleFollowToggle = async () => {
    try {
      if (!currentProfileId || !profile) return;

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('Following')
          .delete()
          .eq('follower_id', currentProfileId)
          .eq('following_id', profile.id);

        if (error) throw error;
        setFollowersCount(prev => prev - 1);
      } else {
        // Follow
        const { error } = await supabase
          .from('Following')
          .insert([
            { follower_id: currentProfileId, following_id: profile.id }
          ]);

        if (error) throw error;
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch {
      // Erreur lors du suivi/désuivi
    }
  };

  useEffect(() => {
    loadUserProfileData();
  }, [loadUserProfileData]);

  return {
    profile,
    tweets,
    comments,
    mediaTweets,
    likedTweets,
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