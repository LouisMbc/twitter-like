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
  const [mediaTweets, setMediaTweets] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // États pour pagination
  const [tweetPage, setTweetPage] = useState(0);
  const [commentPage, setCommentPage] = useState(0);
  const [hasTweetsMore, setHasTweetsMore] = useState(true);
  const [hasCommentsMore, setHasCommentsMore] = useState(true);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // Fonction pour charger un profil spécifique (ex: autre utilisateur)
  const loadProfileData = async (userId: string) => {
    try {
      setLoading(true);
      setIsInitialized(false);
      
      // Optimisation: Chargement du profil en priorité, autres données en arrière-plan
      const { data: profileData, error } = await profileService.getUserProfile(userId);
      
      if (error) {
        throw error;
      }
      
      if (!profileData) {
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      // Afficher immédiatement le profil
      setProfile(profileData);
      setCurrentProfileId(profileData.id);
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
      
      // Charger les tweets et commentaires en arrière-plan
      await Promise.allSettled([
        loadMoreTweets(profileData.id, 0),
        loadAllComments(profileData.id)
      ]);

      setLoading(false);
      setIsInitialized(true);

    } catch (error) {
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
          code: profileError.code,
          message: profileError.message
        });
        
        if (profileError.code === 'PGRST116') {
        }
        throw profileError;
      }

      if (!profileData) {
        setProfile(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Conserver le nickname tel quel dans les données
      setProfile(profileData);
      setCurrentProfileId(profileData.id);
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
      
      // Charger les données en arrière-plan
      await Promise.allSettled([
        loadMoreTweets(profileData.id, 0),
        loadAllComments(profileData.id)
      ]);
      
      setLoading(false);
      setIsInitialized(true);
      
    } catch (error) {
      const errorDetails = error instanceof Error 
        ? { name: error.name, message: error.message }
        : { error };
        
      
      if (error instanceof Error && error.message.includes('auth')) {
      }
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Fonction pour charger plus de tweets
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
    } catch (error) {
    } finally {
      setTweetsLoading(false);
    }
  };

  // Fonction pour charger tous les commentaires
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
    } catch (error) {
    } finally {
      setCommentsLoading(false);
    }
  };

  // Fonction pour charger plus de commentaires avec pagination
  const loadMoreComments = async (profileId: string, page: number) => {
    try {
      setCommentsLoading(true);
      // Implementation similaire à loadMoreTweets mais pour les commentaires
      // Cette fonction peut être élaborée davantage si nécessaire
      setCommentPage(page);
    } catch (error) {
    } finally {
      setCommentsLoading(false);
    }
  };

  // Sélectionne une langue aléatoire (utile pour MultiluinguiX)
  const getRandomLanguage = (languages: string[]) => {
    const randomIndex = Math.floor(Math.random() * languages.length);
    return languages[randomIndex];
  };

  // Fonctions pour charger plus d'éléments
  const loadMoreTweetsData = useCallback(() => {
    if (!profile || !hasTweetsMore || tweetsLoading) return;
    loadMoreTweets(profile.id, tweetPage + 1);
  }, [profile, hasTweetsMore, tweetsLoading, tweetPage]);

  const loadMoreCommentsData = useCallback(() => {
    if (!profile || !hasCommentsMore || commentsLoading) return;
    loadMoreComments(profile.id, commentPage + 1);
  }, [profile, hasCommentsMore, commentsLoading, commentPage]);

  // Chargement des données au montage du composant
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Ajouter des méthodes pour mettre à jour les compteurs
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
    mediaTweets,
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
    loadMoreComments
  };
};
export default useProfile;


