import supabase from '@/lib/supabase';
import { notificationService } from '@/services/supabase/notification';

export const tweetService = {
  getTweetById: async (tweetId: string) => {
    const { data, error } = await supabase
      .from('Tweets')
      .select(`
        *,
        author:Profile!author_id (
          id,
          nickname,
          profilePicture
        )
      `)
      .eq('id', tweetId)
      .single();

    return { data, error };
  },

  incrementViewCount: async (tweetId: string, currentCount: number) => {
    const { error } = await supabase
      .from('Tweets')
      .update({ view_count: (currentCount || 0) + 1 })
      .eq('id', tweetId);

    return { error };
  },

  createRetweet: async (userId: string, originalTweetId: string) => {
    const { data: originalTweet, error: fetchError } = await supabase
      .from('Tweets')
      .select('content, picture, author_id')
      .eq('id', originalTweetId)
      .single();
    
    if (fetchError) return { data: null, error: fetchError };
    
    const { data, error } = await supabase
      .from('Tweets')
      .insert([{
        author_id: userId,
        content: originalTweet.content,
        picture: originalTweet.picture,
        retweet_id: originalTweetId
      }])
      .select();

    if (!error && data && originalTweet.author_id !== userId) {
      await notificationService.createRetweetNotification(
        originalTweetId,
        originalTweet.author_id,
        userId
      );
    }
    
    return { data, error };
  },
  
  hasRetweeted: async (userId: string, tweetId: string) => {
    const { data, error } = await supabase
      .from('Tweets')
      .select('id')
      .eq('author_id', userId)
      .eq('retweet_id', tweetId);
    
    return { hasRetweeted: !!data && data.length > 0, error };
  },
  
  removeRetweet: async (userId: string, originalTweetId: string) => {
    const { data, error } = await supabase
      .from('Tweets')
      .delete()
      .eq('author_id', userId)
      .eq('retweet_id', originalTweetId);
    
    return { data, error };
  },

  getTweetForRetweet: async (tweetId: string) => {
    const { data, error } = await supabase
      .from('Tweets')
      .select(`
        *,
        author:Profile!author_id (
          id,
          nickname,
          profilePicture
        )
      `)
      .eq('id', tweetId)
      .single();

    return { data, error };
  },

  createTweet: async (content: string, authorId: string, picture: string[] = []) => {
    const { data, error } = await supabase
      .from('Tweets')
      .insert([{
        author_id: authorId,
        content: content,
        picture: picture
      }])
      .select();

    if (data && data.length > 0) {
      const { data: followers } = await supabase
        .from('Following')
        .select('follower_id')
        .eq('following_id', authorId);
      
      if (followers && followers.length > 0) {
      
        
        const notificationPromises = followers.map(follower => 
          notificationService.createNotification({
            user_id: follower.follower_id,
            sender_id: authorId,
            content_id: data[0].id,
            content_type: 'tweet',
            type: 'new_tweet',
            message: `a publié un nouveau tweet`
          })
        );
        
        await Promise.all(notificationPromises);
      }
    }

    return { data, error };
  },
};