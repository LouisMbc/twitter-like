import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Tweet } from '@/types';

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
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!session) {
        throw new Error("Utilisateur non authentifié");
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const { data: followingData, error: followingError } = await supabase
        .from('Following')
        .select('following_id')
        .eq('follower_id', profileData.id);
      
      if (followingError) {
        throw followingError;
      }
      
      const followingIds = followingData?.map(item => item.following_id) || [];
      const userIds = [...followingIds, profileData.id];
      
      if (followingIds.length === 0) {
        // Utilisateur ne suit personne
      }
      
      if (userIds.length === 0) {
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
        throw tweetsError;
      }
      
      let allTweets = initialTweets;
      
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
            .map(item => item.Tweets as Tweet);
          
          const allTweetsCombined = [...(allTweets || []), ...formattedHashtagTweets];
          const uniqueTweets = allTweetsCombined.filter((tweet, index, self) => 
            index === self.findIndex(t => t.id === tweet.id)
          );
          
          allTweets = uniqueTweets.sort((a, b) => 
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
        }
      }
      
      if (!allTweets) {
        setTweets([]);
        return;
      }
      
      if (!Array.isArray(allTweets)) {
        setTweets([]);
        return;
      }
      
      if (allTweets.length === 0) {
        setTweets([]);
        return;
      }
      
      try {
        const formattedTweets = allTweets.map((tweet) => {
          let author;
          try {
            author = Array.isArray(tweet.author) 
              ? tweet.author[0] 
              : tweet.author;
            
            if (!author) {
              author = { id: 'inconnu', nickname: 'Utilisateur inconnu', profilePicture: null };
            }
          } catch {
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
        
        const enrichTweetsWithOriginals = async (tweets: Tweet[]): Promise<Tweet[]> => {
          const retweetIds = tweets
            .filter((tweet: Tweet) => tweet.retweet_id)
            .map((tweet: Tweet) => tweet.retweet_id);
          
          if (retweetIds.length === 0) {
            return tweets;
          }
          
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
          
          const originalsMap: { [key: string]: Tweet } = {};
          if (originalTweets) {
            originalTweets.forEach(original => {
              originalsMap[original.id] = original;
            });
          }
          
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
        throw formatError;
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du feed');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFeed();
  }, []);
  
  const refreshFeed = () => {
    fetchFeed();
  };
  
  const loadMoreTweets = () => {
    if (hasMore && !loading) {
      fetchFeed(page + 1);
    }
  };

  return { tweets, loading, error, refreshFeed, loadMoreTweets, hasMore };
}