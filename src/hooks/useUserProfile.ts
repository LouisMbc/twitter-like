"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile } from '@/types/profile';

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
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');

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

      // Récupérer le profil de l'utilisateur connecté
      const { data: currentUserProfile } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (currentUserProfile) {
        setCurrentProfileId(currentUserProfile.id);
      }

      // Debug: Log de l'userId reçu
      console.log('Recherche du profil pour userId:', userId);

      // Récupérer le profil cible - essayer d'abord par id, puis par user_id
      let profileData = null;
      
      // Tentative 1: récupérer par id de profil
      const { data: profileById, error: errorById } = await supabase
        .from('Profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileById) {
        profileData = profileById;
        console.log('Profil trouvé par ID:', profileData);
      } else {
        // Tentative 2: récupérer par user_id
        const { data: profileByUserId, error: errorByUserId } = await supabase
          .from('Profile')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileByUserId) {
          profileData = profileByUserId;
          console.log('Profil trouvé par user_id:', profileData);
        } else {
          console.error('Profil non trouvé:', { errorById, errorByUserId });
          setLoading(false);
          return;
        }
      }

      // Nettoyer le nickname s'il contient des @
      if (profileData.nickname && profileData.nickname.startsWith('@')) {
        profileData.nickname = profileData.nickname.substring(1);
      }

      setProfile(profileData);

      // Récupérer les compteurs de followers/following et l'état de suivi
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

      // Charger les tweets de l'utilisateur
      const { data: tweetsData, error: tweetsError } = await supabase
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

      if (tweetsError) {
        console.error('Erreur lors du chargement des tweets:', tweetsError);
      } else {
        // Nettoyer les nicknames des auteurs
        const cleanedTweets = (tweetsData || []).map(tweet => ({
          ...tweet,
          author: tweet.author ? {
            ...tweet.author,
            nickname: tweet.author.nickname?.replace(/^@+/, '') || ''
          } : null
        }));
        setTweets(cleanedTweets);
      }

      // Charger les commentaires de l'utilisateur
      const { data: commentsData, error: commentsError } = await supabase
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

      if (commentsError) {
        console.error('Erreur lors du chargement des commentaires:', commentsError);
      } else {
        // Nettoyer les nicknames des auteurs de commentaires
        const cleanedComments = (commentsData || []).map(comment => ({
          ...comment,
          author: comment.author ? {
            ...comment.author,
            nickname: comment.author.nickname?.replace(/^@+/, '') || ''
          } : null
        }));
        setComments(cleanedComments);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données du profil utilisateur:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
    } catch (error) {
      console.error('Erreur lors du follow/unfollow:', error);
    }
  };

  useEffect(() => {
    loadUserProfileData();
  }, [loadUserProfileData]);

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