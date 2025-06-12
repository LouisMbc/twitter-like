import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Tweet } from '@/types';
import { tweetService } from '@/services/supabase/tweet';
import { hashtagService } from '@/services/supabase/hashtag';

export default function useFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const TWEETS_PER_PAGE = 10;

  const fetchFeed = async (pageToLoad = 0) => {
    try {
      setLoading(true);
      
      // 1. Obtenir l'identifiant de l'utilisateur connecté
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erreur de session:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.error('Pas de session trouvée');
        throw new Error("Utilisateur non authentifié");
      }
      
      // 2. Récupérer le profil de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profileData) throw new Error('Profil non trouvé');
      
      if (profileError) {
        console.error('Erreur de profil:', profileError);
        throw profileError;
      }

      // 3. Récupérer la liste des utilisateurs suivis
      const { data: followingData, error: followingError } = await supabase
        .from('Following')
        .select('following_id')
        .eq('follower_id', profileData.id);
      
      if (followingError) {
        console.error('Erreur lors de la récupération des following:', followingError);
        throw followingError;
      }
      
      // 4. Préparer un tableau avec les IDs des utilisateurs suivis + l'utilisateur lui-même
      const followingIds = followingData?.map(item => item.following_id) || [];
      const userIds = [...followingIds, profileData.id];
      
      // 5. Si l'utilisateur ne suit personne, afficher un message approprié
      if (followingIds.length === 0) {
        console.log("Vous ne suivez aucun utilisateur. Seuls vos tweets seront affichés.");
      }
      
      // 6. Récupérer tous les tweets des utilisateurs suivis + les siens
      if (userIds.length === 0) {
        console.error('Aucun ID d\'utilisateur pour récupérer les tweets');
        setTweets([]);
        return;
      }
      
      const query = supabase
        .from('Tweets')
        .select(`
          id,
          content,
          picture,
          published_at,
          view_count,
          retweet_id,
          author_id,
          author:author_id (
            id,
            nickname,
            profilePicture
          )
        `)
        .in('author_id', userIds)
        .order('published_at', { ascending: false })
        .range(pageToLoad * TWEETS_PER_PAGE, (pageToLoad + 1) * TWEETS_PER_PAGE - 1);

      const { data: initialTweets, error: tweetsError } = await query;
      
      if (tweetsError) {
        console.error('Erreur lors de la récupération des tweets:', tweetsError);
        throw tweetsError;
      }
      
      let allTweets = initialTweets;
      
      // 7. Récupérer les tweets des hashtags suivis
      const { data: hashtagSubscriptions } = await supabase
        .from('hashtag_subscriptions') 
        .select('hashtag_id')
        .eq('profile_id', profileData.id);

      if (hashtagSubscriptions && hashtagSubscriptions.length > 0) {
        const hashtagIds = hashtagSubscriptions.map(sub => sub.hashtag_id);
        
        const { data: hashtagTweets } = await supabase
          .from('tweet_hashtags')
          .select(`
            Tweets (
              id,
              content,
              picture,
              published_at,
              view_count,
              retweet_id,
              author_id,
              author:author_id (
                id,
                nickname,
                profilePicture
              )
            )
          `)
          .in('hashtag_id', hashtagIds)
          .order('created_at', { ascending: false })
          .range(pageToLoad * TWEETS_PER_PAGE, (pageToLoad + 1) * TWEETS_PER_PAGE - 1);

        if (hashtagTweets) {
          const formattedHashtagTweets = hashtagTweets
            .filter(item => item.Tweets)
            .map(item => item.Tweets as any);
          
          // Fusionner avec les tweets existants et supprimer les doublons
          const allTweetsCombined = [...(allTweets || []), ...formattedHashtagTweets];
          const uniqueTweets = allTweetsCombined.filter((tweet, index, self) => 
            index === self.findIndex(t => t.id === tweet.id)
          );
          
          // Trier par date
          allTweets = uniqueTweets.sort((a, b) => 
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
        }
      }
      
      // 7. S'assurer que les données sont valides
      if (!allTweets) {
        console.error('allTweets est undefined ou null');
        setTweets([]);
        return;
      }
      
      if (!Array.isArray(allTweets)) {
        console.error('allTweets n\'est pas un tableau:', typeof allTweets);
        setTweets([]);
        return;
      }
      
      if (allTweets.length === 0) {
        console.log("Aucun tweet trouvé dans votre fil d'actualité");
        setTweets([]);
        return;
      }
      
      // Transformer les données pour correspondre à votre interface Tweet
      try {
        const formattedTweets = allTweets.map((tweet, index) => {
          
          // Vérifier si author est un tableau et prendre le premier élément si c'est le cas
          let author;
          try {
            author = Array.isArray(tweet.author) 
              ? tweet.author[0] 
              : tweet.author;
            
            if (!author) {
              console.warn(`Tweet ${tweet.id}: Auteur manquant, utilisation d'une valeur par défaut`);
              author = { id: 'inconnu', nickname: 'Utilisateur inconnu', profilePicture: null };
            }
          } catch (authorError) {
            console.error(`Erreur lors du traitement de l'auteur pour le tweet ${tweet.id}:`, authorError);
            author = { id: 'inconnu', nickname: 'Utilisateur inconnu', profilePicture: null };
          }
          
          return {
            id: tweet.id,
            content: tweet.content || '',
            picture: tweet.picture || null,
            published_at: tweet.published_at || new Date().toISOString(),
            view_count: tweet.view_count || 0,
            retweet_id: tweet.retweet_id || null,
            author: author,
            author_id: tweet.author_id,
            originalTweet: null
          };
        });
        
        // Pour chaque retweet, récupérer le tweet original
        // Typer la fonction d'enrichissement pour les retweets
        const enrichTweetsWithOriginals = async (tweets: Tweet[]): Promise<Tweet[]> => {
          // Collectez tous les retweet_ids
          const retweetIds = tweets
            .filter((tweet: Tweet) => tweet.retweet_id)
            .map((tweet: Tweet) => tweet.retweet_id);
          
          // Si aucun retweet, retourner les tweets tels quels
          if (retweetIds.length === 0) {
            return tweets;
          }
          
          // Récupérer tous les tweets originaux en une seule requête
          const { data: originalTweets } = await supabase
            .from('Tweets')
            .select(`
              id,
              content,
              picture,
              published_at,
              view_count,
              author:Profile!author_id (
                id,
                nickname,
                profilePicture
              )
            `)
            .in('id', retweetIds);
          
          // Créer un mapping pour un accès facile
          const originalsMap: { [key: string]: any } = {};
          if (originalTweets) {
            originalTweets.forEach(original => {
              originalsMap[original.id] = original;
            });
          }
          
          // Enrichir les tweets
          return tweets.map((tweet: Tweet) => {
            if (tweet.retweet_id && originalsMap[tweet.retweet_id]) {
              tweet.originalTweet = originalsMap[tweet.retweet_id];
            }
            return tweet;
          });
        };

        const enrichedTweets = await enrichTweetsWithOriginals(formattedTweets);
        if (pageToLoad === 0) {
          setTweets(enrichedTweets);
        } else {
          setTweets(prev => [...prev, ...enrichedTweets]);
        }
        
        setHasMore(enrichedTweets.length === TWEETS_PER_PAGE);
        setPage(pageToLoad);
      } catch (formatError) {
        console.error('Erreur lors du formatage des tweets:', formatError);
        throw formatError;
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement du feed:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du feed');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger le feed au montage du composant
  useEffect(() => {
    fetchFeed();
  }, []);
  
  // Fonction pour rafraîchir le feed
  const refreshFeed = () => {
    fetchFeed();
  };
  
  // Fonction pour charger plus de tweets
  const loadMoreTweets = () => {
    if (hasMore && !loading) {
      fetchFeed(page + 1);
    }
  };

  return { tweets, loading, error, refreshFeed, loadMoreTweets, hasMore };
}