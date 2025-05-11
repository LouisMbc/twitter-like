"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile } from '@/types/profile';
import { profileService } from '@/services/supabase/profile';

export const useProfile = () => {
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
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Ajouter une vérification explicite si l'utilisateur n'est pas connecté
        console.info('Aucune session utilisateur trouvée - utilisateur non connecté');
        setProfile(null);
        setLoading(false);
        return;
      }

      // Récupérer les informations du profil
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        // Améliorer l'affichage de l'erreur avec plus de détails
        console.error('Erreur lors de la récupération du profil :', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details
        });
        
        // Vérifier si c'est une erreur de "profil non trouvé"
        if (profileError.code === 'PGRST116') {
          console.warn('Profil non trouvé pour l\'utilisateur actuel - création nécessaire');
        }
        throw profileError;
      }

      if (!profileData) {
        console.warn('Aucune donnée de profil reçue - le profile est peut-être manquant');
        setProfile(null);
        setLoading(false);
        return;
      }

      // Reste du code pour configurer le profil
      setProfile(profileData);
      setTweets(profileData.tweets || []);
      setFollowersCount(profileData.followers_count || 0);
      setFollowingCount(profileData.following_count || 0);
    } catch (error) {
      // Améliorer la gestion des erreurs pour obtenir plus d'informations
      const errorDetails = error instanceof Error 
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error };
        
      console.error('Erreur lors du chargement du profil connecté :', errorDetails);
      
      // Vérifier si c'est une erreur d'authentification
      if (error instanceof Error && error.message.includes('auth')) {
        console.warn('Possible problème d\'authentification - vérifiez que l\'utilisateur est connecté');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Sélectionne une langue aléatoire (utile pour MultiluinguiX)
  const getRandomLanguage = (languages: string[]) => {
    const randomIndex = Math.floor(Math.random() * languages.length);
    return languages[randomIndex];
  };

  // Ajouter des méthodes pour mettre à jour les compteurs
  const incrementFollowingCount = useCallback(() => {
    setFollowingCount(prevCount => prevCount + 1);
  }, []);

  const decrementFollowingCount = useCallback(() => {
    setFollowingCount(prevCount => Math.max(0, prevCount - 1));
  }, []);

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
    refreshProfile: loadProfile, // Exposer la fonction pour permettre le rafraîchissement
    incrementFollowingCount,
    decrementFollowingCount
  };
};

export default useProfile;
