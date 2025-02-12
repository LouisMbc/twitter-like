"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import TweetCard from '@/components/tweets/TweetCard';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  firstName: string;
  lastName: string;
  nickname: string;
  bio: string;
  profilePicture: string;
  created_at: string;
  follower_count: number;
  following_count: number;
}

interface Tweet {
  id: string;
  content: string;
  picture: string | null;
  published_at: string;
  view_count: number;
  author: {
    id: string;
    nickname: string;
    profilePicture: string | null;
  };
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  tweet_id: number;
  parent_comment_id: number | null;
  tweet: {
    content: string;
  };
  author: {
    nickname: string;
    profilePicture: string;
  };
}

const loadComments = async (userId: string) => {
  const { data: comments, error } = await supabase
    .from('Comments')
    .select(`
      id,
      content,
      created_at,
      tweet_id,
      tweet:Tweets(content),
      author:Profile!author_id (
        id,
        nickname,
        profilePicture
      )
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return comments || [];
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useAuth(); // Vérifie l'authentification

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        // Charger le profil avec les compteurs
        const { data: profileData, error: profileError } = await supabase
          .from('Profile')
          .select('*, follower_count, following_count')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) throw profileError;
        
        if (profileData) {
          setProfile(profileData);
          // Mettre à jour les compteurs depuis le profil
          setFollowersCount(profileData.follower_count || 0);
          setFollowingCount(profileData.following_count || 0);
        }

        // Charger les tweets
        const { data: tweetsData, error: tweetsError } = await supabase
          .from('Tweets')
          .select(`
            id,
            content,
            picture,
            published_at,
            view_count,
            retweet_id,
            author:Profile!author_id ( 
              id,
              nickname,
              profilePicture
            )
          `)
          .eq('author_id', profileData.id)
          .order('published_at', { ascending: false });

        if (tweetsError) throw tweetsError;
        const formattedTweets = (tweetsData || []).map(tweet => ({
          id: tweet.id,
          content: tweet.content,
          picture: tweet.picture || null,
          published_at: tweet.published_at,
          view_count: tweet.view_count,
          retweet_id: tweet.retweet_id || null,
          author: tweet.author // Accès direct à l'objet author au lieu de tweet.author[0]
        }));
        setTweets(formattedTweets);

        // Charger les commentaires de l'utilisateur
        const commentsData = await loadComments(profileData.id); // Utiliser l'ID du profil
        const formattedComments = commentsData.map(comment => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          tweet: {
            content: comment.tweet?.content || ''
          },
          author: {
            nickname: comment.author?.nickname || '',
            profilePicture: comment.author?.profilePicture || null
          }
        }));
        setComments(formattedComments);

      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center p-8">Profil non trouvé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
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
                <p className="text-gray-600">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Membre depuis {formatDistance(new Date(profile.created_at), new Date(), { locale: fr })}
                </p>
              </div>
              <button
                onClick={() => router.push('/profile/edit')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Éditer le profil
              </button>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 mt-4">
              <div>
                <span className="font-bold">{followersCount}</span>
                <span className="text-gray-600 ml-1">Abonnés</span>
              </div>
              <div>
                <span className="font-bold">{followingCount}</span>
                <span className="text-gray-600 ml-1">Abonnements</span>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b mb-6">
        <div className="flex space-x-8">
          <button
            className={`py-4 ${
              activeTab === 'tweets'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('tweets')}
          >
            Tweets
          </button>
          <button
            className={`py-4 ${
              activeTab === 'comments'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('comments')}
          >
            Commentaires
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'tweets' ? (
        <div className="space-y-4">
          {tweets.map(tweet => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white rounded-lg shadow p-4">
              {/* Tweet parent */}
              <div className="text-sm text-gray-500 mb-2">
                En réponse à: {comment.tweet.content.substring(0, 100)}...
              </div>
              
              {/* Commentaire */}
              <div className="flex space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {comment.author.profilePicture ? (
                    <img
                      src={comment.author.profilePicture}
                      alt={comment.author.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">
                        {comment.author.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{comment.author.nickname}</span>
                    <span className="text-gray-500 text-sm">
                      {formatDistance(new Date(comment.created_at), new Date(), { locale: fr, addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center text-gray-500">
              Aucun commentaire pour le moment
            </div>
          )}
        </div>
      )}
    </div>
  );
}