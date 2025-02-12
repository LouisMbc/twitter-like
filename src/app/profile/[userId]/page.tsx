"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import TweetCard from '@/components/tweets/TweetCard';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import FollowButton from '@/components/following/FollowButton';
import TweetList from '@/components/tweets/TweetList';
import TweetComposer from '@/components/tweets/TweetComposer';
import useFeed from '@/hooks/useFeed';

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  bio: string;
  profilePicture: string;
  created_at: string;
  follower_count: number;
  following_count: number;
}

interface Author {
  id: string;
  nickname: string;
  profilePicture: string | null;
}

interface Tweet {
  id: string;
  content: string;
  picture: string[] | null;
  published_at: string;
  view_count: number;
  retweet_id?: string;
  author: {
    id: string;
    nickname: string;
    profilePicture: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  tweet: {
    content: string;
  };
  author: Author;
}

interface Params {
  userId: string;
}

export default function UserProfilePage() {
  const params = useParams() as { userId: string };
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  const [loading, setLoading] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const { tweets: feedTweets, loading: feedLoading, error: feedError, refreshFeed } = useFeed();

  // Charge les données du profil
  useEffect(() => {
    const loadProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user.id === params.userId) {
        router.push('/profile');
        return;
      }

      try {
        // 1. Charger le profil
        const { data: profileData, error: profileError } = await supabase
          .from('Profile')
          .select('id, firstName, lastName, nickname, profilePicture, bio, follower_count, following_count, created_at')
          .eq('id', params.userId)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('Profil non trouvé');

        // 2. Mettre à jour l'état du profil
        setProfile(profileData);
        setFollowersCount(profileData.follower_count);
        setFollowingCount(profileData.following_count);

        // La requête Supabase pour obtenir les tweets d'un auteur
        const { data: tweetsData, error: tweetsError } = await supabase
          .from('Tweets')
          .select(`
            *,
            author:Profile!author_id ( 
              id,
              nickname,
              profilePicture
            )
          `)
          .eq('author_id', params.userId)
          .order('published_at', { ascending: false });

        if (tweetsError) throw tweetsError;

        const formattedTweets: Tweet[] = (tweetsData || []).map(tweet => {
          console.log('Processing tweet:', tweet); // Debug
          return {
            id: tweet.id,
            content: tweet.content,
            picture: tweet.picture || null,
            published_at: tweet.published_at,
            view_count: tweet.view_count,
            retweet_id: tweet.retweet_id || null,
            author: {
              id: tweet.author?.id || params.userId,
              nickname: tweet.author?.nickname || 'Utilisateur inconnu',
              profilePicture: tweet.author?.profilePicture || null
            }
          };
        });

        setTweets(formattedTweets);
        console.log('Tweet data structure:', tweetsData?.[0]);
        console.log('Tweet author structure:', tweetsData?.[0]?.author);
        
        // 4. Charger les commentaires
        const { data: commentsData, error: commentsError } = await supabase
          .from('Comments')
          .select('id, content, created_at, tweet:Tweets!tweet_id(content), author:Profile!author_id(nickname, profilePicture)')
          .eq('author_id', params.userId)
          .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        const formattedComments: Comment[] = (commentsData || []).map(comment => ({
          ...comment,
          tweet: comment.tweet[0] || { content: '' },
          author: comment.author[0] || { nickname: '', profilePicture: null }
        }));

        setComments(formattedComments);

      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [params.userId, router]);

  useEffect(() => {
    const loadCurrentProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: currentProfile } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (currentProfile) {
        setCurrentProfileId(currentProfile.id);
      }
    };

    loadCurrentProfile();
  }, []);

  // Vérifie si l'utilisateur suit ce profil
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!currentProfileId) return;

      const { data: followData } = await supabase
        .from('Following')
        .select('*')
        .match({
          follower_id: currentProfileId,
          following_id: params.userId
        })
        .single();

      setIsFollowing(!!followData);
    };

    checkFollowingStatus();
  }, [params.userId, currentProfileId]);

  // Met à jour le statut de suivi
  const handleFollowToggle = async () => {
    try {
      if (!currentProfileId) return;

      if (isFollowing) {
        // Désabonnement via RPC
        const { data, error } = await supabase.rpc('handle_unfollow', {
          follower: currentProfileId,
          target: params.userId
        });

        if (error) throw error;
      } else {
        // Abonnement via RPC
        const { data, error } = await supabase.rpc('handle_follow', {
          follower: currentProfileId,
          target: params.userId
        });

        if (error) throw error;
      }

      // Mettre à jour l'état local
      setIsFollowing(!isFollowing);
      
      // Rafraîchir les compteurs
      const { data: updatedProfile } = await supabase
        .from('Profile')
        .select('follower_count, following_count')
        .eq('id', params.userId)
        .single();

      if (updatedProfile) {
        setFollowersCount(updatedProfile.follower_count);
        setFollowingCount(updatedProfile.following_count);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Vérifier que l'utilisateur est authentifié
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  if (loading || feedLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (feedError) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-500 text-center">{feedError}</div>
      </div>
    );
  }

  if (!profile) {
    return <div className="flex justify-center p-8">Profil non trouvé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 mt-20">
      {/* En-tête du profil */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Photo de profil */}
          <div className="w-32 h-32 rounded-full overflow-hidden">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-500">
                  {profile.firstName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Informations du profil */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{profile.nickname}</h1>
                <p className="text-gray-600">{profile.firstName} {profile.lastName}</p>
                <div className="flex space-x-4 mt-2">
                  <span className="text-gray-600">{followersCount} abonnés</span>
                  <span className="text-gray-600">{followingCount} abonnements</span>
                </div>
              </div>
              {currentProfileId && currentProfileId !== params.userId && (
                <FollowButton 
                  currentProfileId={currentProfileId}
                  targetProfileId={params.userId}
                  isFollowing={isFollowing}
                  onFollowToggle={handleFollowToggle}
                />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Membre depuis {formatDistance(new Date(profile.created_at), new Date(), { locale: fr })}
            </p>
            {profile.bio && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section pour créer un nouveau tweet */}
      <div className="bg-white rounded-lg shadow mb-6">
        <TweetComposer onSuccess={refreshFeed} />
      </div>

      {/* Onglets pour les tweets et les commentaires */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('tweets')}
            className={`px-4 py-2 rounded-full ${activeTab === 'tweets' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Tweets
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-full ${activeTab === 'comments' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Commentaires
          </button>
        </div>
      </div>

      {/* Liste des tweets ou des commentaires */}
      <div className="space-y-4">
        {activeTab === 'tweets' ? (
          <TweetList tweets={tweets} />
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {comment.author.profilePicture ? (
                    <img
                      src={comment.author.profilePicture}
                      alt={comment.author.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl text-gray-500">
                        {comment.author.nickname.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{comment.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Commenté sur: {comment.tweet.content}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {formatDistance(new Date(comment.created_at), new Date(), { locale: fr })}
                  </p>
                </div>
              </div>  
            </div>
          ))
        )}
      </div>
    </div>
  );
}
