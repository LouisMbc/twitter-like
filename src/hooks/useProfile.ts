import { useState, useEffect, useCallback } from 'react';
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

  // Utilisez useCallback pour éviter les re-créations inutiles de la fonction
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await profileService.getProfile(session.user.id);
      
      if (profileError) {
        console.error('Erreur profil:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log("Aucun profil trouvé, redirection vers setup");
        router.push('/profile/setup');
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
  }, [router]); // Ajoutez router comme dépendance

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
    activeTab,
    setActiveTab,
    followersCount,
    followingCount,
    loading,
    currentProfileId,
    refreshProfile: loadProfile, // Exposer la fonction pour permettre le rafraîchissement
    incrementFollowingCount,
    decrementFollowingCount
  };
};