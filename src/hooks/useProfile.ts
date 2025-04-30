"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';
import profileService from '@/services/profileService';

const useProfile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Fonction pour charger un profil spécifique (ex: autre utilisateur)
  const loadProfileData = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data: profileData, error } = await profileService.getUserProfile(userId);
      
      if (error) {
        throw error;
      }
      
      if (!profileData) {
        console.error('Profil non trouvé');
        return;
      }
      
      setProfile(profileData);
      setCurrentProfileId(profileData.id);
      
      // Chargement parallèle des tweets et commentaires pour de meilleures performances
      const [tweetsResponse, commentsResponse] = await Promise.all([
        profileService.getUserTweets(profileData.id),
        profileService.getUserComments(profileData.id)
      ]);
      
      setTweets(tweetsResponse.data || []);
      setComments(commentsResponse.data || []);
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utilisez useCallback pour éviter les re-créations inutiles de la fonction
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const userId = session.user.id;
      
      const { data: profileData, error } = await profileService.getUserProfile(userId);
      
      if (error) {
        throw error;
      }
      
      if (!profileData) {
        console.error('Profil non trouvé');
        return;
      }
      
      setProfile(profileData);
      setCurrentProfileId(profileData.id);

      // Chargement parallèle des tweets et commentaires pour de meilleures performances
      const [tweetsResponse, commentsResponse] = await Promise.all([
        profileService.getUserTweets(profileData.id),
        profileService.getUserComments(profileData.id)
      ]);
      
      setTweets(tweetsResponse.data || []);
      setComments(commentsResponse.data || []);
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement du profil connecté :', error);
    } finally {
      setLoading(false);
    }
  }, [router]); // Ajoutez router comme dépendance

  // Sélectionne une langue aléatoire (utile pour MultiluinguiX)
  const getRandomLanguage = (languages: string[]) => {
    const randomIndex = Math.floor(Math.random() * languages.length);
    return languages[randomIndex];
  };

  // Chargement des données au montage du composant
  useEffect(() => {
    loadProfile();
  }, [loadProfile]); // Utiliser loadProfile comme dépendance

  return {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    loading,
    currentProfileId,
    loadProfileData,
    getRandomLanguage,
    refreshProfile: loadProfile // Exposer la fonction pour permettre le rafraîchissement
  };
};

export default useProfile;
