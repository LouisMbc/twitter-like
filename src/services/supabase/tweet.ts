import supabase from '@/lib/supabase';

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

  // Méthode pour créer un retweet
  createRetweet: async (userId: string, originalTweetId: string) => {
    // D'abord, récupérer les informations du tweet original
    const { data: originalTweet, error: fetchError } = await supabase
      .from('Tweets')
      .select('content, picture')
      .eq('id', originalTweetId)
      .single();
    
    if (fetchError) return { data: null, error: fetchError };
    
    // Ensuite, créer un nouveau tweet qui référence le tweet original
    const { data, error } = await supabase
      .from('Tweets')
      .insert([{
        author_id: userId,
        content: originalTweet.content,  // Même contenu que l'original
        picture: originalTweet.picture,  // Mêmes images que l'original
        retweet_id: originalTweetId      // Référence au tweet original
      }])
      .select();
    
    return { data, error };
  },
  
  // Vérifier si un utilisateur a retweeté un tweet spécifique
  hasRetweeted: async (userId: string, tweetId: string) => {
    const { data, error } = await supabase
      .from('Tweets')
      .select('id')
      .eq('author_id', userId)
      .eq('retweet_id', tweetId);
    
    if (error) return { hasRetweeted: false, error };
    
    return { 
      hasRetweeted: data && data.length > 0, 
      error: null 
    };
  },
  
  // Supprimer un retweet
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
};