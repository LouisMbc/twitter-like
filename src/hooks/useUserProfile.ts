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
        console.log('Profil trouvé par ID:', profileById);
        profileData = profileById;
      } else {
        // Tentative 2: récupérer par user_id
        const { data: profileByUserId, error: errorByUserId } = await supabase
          .from('Profile')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileByUserId) {
          console.log('Profil trouvé par user_id:', profileByUserId);
          profileData = profileByUserId;
        } else {
          console.error('Profil non trouvé par ID ni par user_id:', { errorById, errorByUserId });
        }
      }

      if (!profileData) {
        console.error('Aucun profil trouvé pour:', userId);
        setProfile(null);
        return;
      }

      setProfile(profileData);

      // Charger les tweets du profil
      const { data: tweetsData, error: tweetsError } = await supabase
        .from('Tweets')
        .select(`
          id, content, picture, published_at, view_count, retweet_id, author_id,
          author:author_id (id, nickname, profilePicture)
        `)
        .eq('author_id', profileData.id)
        .order('published_at', { ascending: false });

      if (tweetsError) {
        console.error('Erreur lors du chargement des tweets:', tweetsError);
      } else {
        setTweets(tweetsData || []);
      }

      // Charger les commentaires du profil
      const { data: commentsData, error: commentsError } = await supabase
        .from('Comments')
        .select('*, tweet:Tweets(*), author:Profile(*)')
        .eq('author_id', profileData.user_id || profileData.id)
        .order('created_at', { ascending: false });

      if (commentsError) {
        console.error('Erreur lors du chargement des commentaires:', commentsError);
      } else {
        setComments(commentsData || []);
      }

      // Charger les statistiques de suivi
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('Following')
          .select('id')
          .eq('following_id', profileData.id),
        supabase
          .from('Following')
          .select('id')
          .eq('follower_id', profileData.id)
      ]);

      setFollowersCount(followersResult.data?.length || 0);
      setFollowingCount(followingResult.data?.length || 0);

      // Vérifier si l'utilisateur actuel suit ce profil
      if (currentUserProfile && profileData.id !== currentUserProfile.id) {
        const { data: followingData } = await supabase
          .from('Following')
          .select('id')
          .eq('follower_id', currentUserProfile.id)
          .eq('following_id', profileData.id)
          .maybeSingle();

        setIsFollowing(!!followingData);
      }

    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
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