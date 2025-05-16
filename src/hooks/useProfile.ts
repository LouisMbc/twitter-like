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
  
  // États pour pagination
  const [tweetPage, setTweetPage] = useState(0);
  const [commentPage, setCommentPage] = useState(0);
  const [hasTweetsMore, setHasTweetsMore] = useState(true);
  const [hasCommentsMore, setHasCommentsMore] = useState(true);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const ITEMS_PER_PAGE = 10;

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

      // Charger les premiers lots de tweets et commentaires
      await loadMoreTweets(profileData.id, 0);
      await loadAllComments(profileData.id);
      
      setFollowersCount(profileData.follower_count || 0);
      setFollowingCount(profileData.following_count || 0);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
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
    activeTab,
    setActiveTab,
    followersCount,
    followingCount,
    loading,
    currentProfileId,
    refreshProfile: loadProfile,
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