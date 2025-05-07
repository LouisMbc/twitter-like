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

  createTweet: async (content: string, authorId: string, picture: string[] = []) => {
    // Code existant...

    // Si le tweet est créé avec succès, créer des notifications pour les abonnés
    if (data) {
      // Récupérer les followers pour envoyer des notifications
      const { data: followers } = await supabase
        .from('Following')
        .select('follower_id')
        .eq('following_id', authorId);
      
      if (followers && followers.length > 0) {
        // Récupérer les informations sur l'auteur pour le message
        const { data: authorData } = await supabase
          .from('Profile')
          .select('nickname')
          .eq('id', authorId)
          .single();
        
        const authorName = authorData ? authorData.nickname : 'Un utilisateur';
        
        // Créer une notification pour chaque follower
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