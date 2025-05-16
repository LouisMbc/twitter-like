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
<<<<<<< HEAD
      
      // Chargement parallèle des tweets et commentaires pour de meilleures performances
      const [tweetsResponse, commentsResponse] = await Promise.all([
        profileService.getUserTweets(profileData.id),
        profileService.getUserComments(profileData.id)
      ]);
      
      setTweets(tweetsResponse.data || []);
      setComments(commentsResponse.data || []);
=======

      // Charger les premiers lots de tweets et commentaires
      await loadMoreTweets(profileData.id, 0);
      await loadAllComments(profileData.id);
      
>>>>>>> origin/louis
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
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
=======
  }, [router]);

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
      
      const formattedTweets = (tweetsData || []).map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        picture: tweet.picture,
        published_at: tweet.published_at,
        view_count: tweet.view_count,
        retweet_id: tweet.retweet_id,
        author: Array.isArray(tweet.author) ? tweet.author[0] : tweet.author
      }));
      
      if (page === 0) {
        setTweets(formattedTweets);
      } else {
        setTweets(prev => [...prev, ...formattedTweets]);
      }
      
      // Déterminer s'il y a plus de tweets à charger
      setHasTweetsMore(formattedTweets.length === ITEMS_PER_PAGE);
      setTweetPage(page);
    } catch (error) {
      console.error('Erreur lors du chargement des tweets:', error);
    } finally {
      setTweetsLoading(false);
    }
  };

  // Fonction pour charger tous les commentaires (sans pagination)
  const loadAllComments = async (profileId: string) => {
    try {
      setLoading(true);
      console.log('🔍 Chargement des commentaires pour le profil:', profileId);
      
      // Vérifier d'abord si l'utilisateur a des commentaires
      const { count, error: countError } = await supabase
        .from('Comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', profileId);

      console.log('📊 Nombre de commentaires trouvés:', count);
      
      if (countError) {
        console.error('❌ Erreur de comptage des commentaires:', countError);
      }
      
      // Problème clé: author_id dans Comments pourrait être user_id et non profile_id
      // Essayons de récupérer le user_id associé au profile
      const { data: profileData } = await supabase
        .from('Profile')
        .select('user_id')
        .eq('id', profileId)
        .single();
        
      console.log('👤 User ID associé au profil:', profileData?.user_id);
      
      // Essayer avec user_id au lieu de profile_id
      const { data: commentsData, error: commentsError } = await supabase
        .from('Comments')
        .select(`
          id, content, created_at, view_count, parent_comment_id, tweet_id, 
          author:author_id (id, nickname, profilePicture)
        `)
        .eq('author_id', profileData?.user_id) // Utiliser user_id au lieu de profile_id
        .order('created_at', { ascending: false });
      
      if (commentsError) {
        console.error('❌ Erreur SQL lors du chargement des commentaires:', commentsError);
        throw commentsError;
      }
      
      console.log(`✅ ${commentsData?.length || 0} commentaires récupérés:`, commentsData);
      
      const formattedComments = (commentsData || []).map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        view_count: comment.view_count || 0,
        tweet_id: comment.tweet_id,
        author: Array.isArray(comment.author) ? comment.author[0] : comment.author,
        parent_comment_id: comment.parent_comment_id || undefined
      }));
      
      console.log('🔄 Commentaires formatés:', formattedComments.length);
      setComments(formattedComments);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
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
>>>>>>> origin/louis

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
    followersCount,
    followingCount,
    loading,
    currentProfileId,
<<<<<<< HEAD
    loadProfileData,
    getRandomLanguage,
    refreshProfile: loadProfile, // Exposer la fonction pour permettre le rafraîchissement
=======
    refreshProfile: loadProfile,
>>>>>>> origin/louis
    incrementFollowingCount,
    decrementFollowingCount,
    // Nouvelles propriétés pour infinite scroll
    tweetsLoading,
    commentsLoading,
    hasTweetsMore,
    hasCommentsMore,
    loadMoreTweets: loadMoreTweetsData,
    loadMoreComments: loadMoreCommentsData
  };
};

export default useProfile;
