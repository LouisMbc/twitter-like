import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile, Tweet, Comment } from '@/types';
import { profileService } from '@/services/supabase/profile';

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

  // Fonction pour charger un profil spécifique (ex: autre utilisateur)
  const loadProfileData = async (userId: string) => {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await profileService.getUserProfile(userId);
      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        setFollowersCount(profileData.follower_count || 0);
        setFollowingCount(profileData.following_count || 0);

        const { data: tweetsData } = await profileService.getUserTweets(profileData.id);
        const { data: commentsData } = await profileService.getUserComments(profileData.id);

        const formattedTweets = tweetsData
          ? tweetsData.map(tweet => ({
              ...tweet,
              author_id: tweet.author?.[0]?.id || profileData.id,
            }))
          : [];

        const formattedComments = commentsData
          ? commentsData.map(comment => {
              const authorData = comment.author?.[0] || {
                id: profileData.id,
                nickname: profileData.nickname || '',
                profilePicture: profileData.avatar || null
              };
              
              return {
                ...comment,
                tweet_id: comment.tweet?.[0]?.id || '',
                view_count: 0, // optionnel
                author: {
                  id: authorData.id,
                  nickname: authorData.nickname,
                  profilePicture: authorData.profilePicture
                }
              };
            })
          : [];

        setTweets(formattedTweets);
        setComments(formattedComments);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur :', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger le profil connecté
  const loadProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await profileService.getProfile(session.user.id);
      if (profileError) throw profileError;

      if (!profileData) {
        router.push('/profile/setup');
        return;
      }

      setProfile(profileData);
      setCurrentProfileId(profileData.id);
      
      const { data: tweetsData } = await profileService.getUserTweets(profileData.id);
      const { data: commentsData } = await profileService.getUserComments(profileData.id);

      const formattedTweets = tweetsData
        ? tweetsData.map((tweet: any) => ({
            ...tweet,
            author_id: tweet.author?.[0]?.id || profileData.id,
          }))
        : [];

      const formattedComments = commentsData
        ? commentsData.map((comment: any) => {
            const authorData = comment.author?.[0] || {
              id: profileData.id,
              nickname: profileData.nickname || '',
              profilePicture: profileData.avatar || null
            };
            
            return {
              ...comment,
              tweet_id: comment.tweet?.[0]?.id || '',
              view_count: 0,
              author: {
                id: authorData.id,
                nickname: authorData.nickname,
                profilePicture: authorData.profilePicture
              }
            };
          })
        : [];

      setTweets(formattedTweets);
      setComments(formattedComments);
    } catch (error) {
      console.error('Erreur lors du chargement du profil connecté :', error);
    } finally {
      setLoading(false);
    }
  };

  // Sélectionne une langue aléatoire (utile pour MultiluinguiX)
  const getRandomLanguage = (languages: string[]) => {
    const randomIndex = Math.floor(Math.random() * languages.length);
    return languages[randomIndex];
  };

  useEffect(() => {
    loadProfile();
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
    loadProfileData,
    getRandomLanguage,
  };
};
