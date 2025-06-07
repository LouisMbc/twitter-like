import supabase from '@/lib/supabase';
import { Hashtag } from '@/types';

export const hashtagService = {
  // Extraire les hashtags d'un texte
  extractHashtags: (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  },

  // Créer ou récupérer des hashtags
  createOrGetHashtags: async (hashtagNames: string[]) => {
    if (hashtagNames.length === 0) return [];

    const hashtags = [];

    for (const name of hashtagNames) {
      // Vérifier si le hashtag existe
      let { data: existingHashtag } = await supabase
        .from('hashtags') 
        .select('*')
        .eq('name', name)
        .single();

      if (existingHashtag) {
        // Incrémenter le compteur d'usage
        const { data: updatedHashtag } = await supabase
          .from('hashtags') 
          .update({ usage_count: existingHashtag.usage_count + 1 })
          .eq('id', existingHashtag.id)
          .select()
          .single();

        if (updatedHashtag) hashtags.push(updatedHashtag);
      } else {
        // Créer un nouveau hashtag
        const { data: newHashtag } = await supabase
          .from('hashtags') // CORRIGÉ : minuscule
          .insert({ name, usage_count: 1 })
          .select()
          .single();

        if (newHashtag) hashtags.push(newHashtag);
      }
    }

    return hashtags;
  },

  // Lier des hashtags à un tweet
  linkHashtagsToTweet: async (tweetId: string, hashtagIds: string[]) => {
    if (hashtagIds.length === 0) return;

    const links = hashtagIds.map(hashtagId => ({
      tweet_id: tweetId,
      hashtag_id: hashtagId
    }));

    const { error } = await supabase
      .from('tweet_hashtags') 
      .insert(links);

    return { error };
  },

  // Rechercher des hashtags
  searchHashtags: async (query: string, limit = 10) => {
    const { data, error } = await supabase
      .from('hashtags') 
      .select('*')
      .ilike('name', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Récupérer les hashtags populaires
  getPopularHashtags: async (limit = 20) => {
    const { data, error } = await supabase
      .from('hashtags') 
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Récupérer les tweets d'un hashtag
  getTweetsByHashtag: async (hashtagName: string, page = 0, limit = 10) => {
    const { data, error } = await supabase
      .from('tweet_hashtags') 
      .select(`
        tweet_id,
        Tweets!inner (
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
        ),
        hashtags!inner (name)
      `)
      .eq('hashtags.name', hashtagName.toLowerCase())
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    return { data, error };
  },

  // S'abonner à un hashtag
  subscribeToHashtag: async (profileId: string, hashtagId: string) => {
    const { data, error } = await supabase
      .from('hashtag_subscriptions') 
      .insert({ profile_id: profileId, hashtag_id: hashtagId })
      .select();

    return { data, error };
  },

  // Se désabonner d'un hashtag
  unsubscribeFromHashtag: async (profileId: string, hashtagId: string) => {
    const { error } = await supabase
      .from('hashtag_subscriptions') 
      .delete()
      .eq('profile_id', profileId)
      .eq('hashtag_id', hashtagId);

    return { error };
  },

  // Bloquer un hashtag
  blockHashtag: async (profileId: string, hashtagId: string) => {
    const { data, error } = await supabase
      .from('hashtag_blocks') // CORRIGÉ : minuscule avec underscore
      .insert({ profile_id: profileId, hashtag_id: hashtagId })
      .select();

    return { data, error };
  },

  // Débloquer un hashtag
  unblockHashtag: async (profileId: string, hashtagId: string) => {
    const { error } = await supabase
      .from('hashtag_blocks')
      .delete()
      .eq('profile_id', profileId)
      .eq('hashtag_id', hashtagId);

    return { error };
  },

  // Vérifier si un utilisateur est abonné à un hashtag
  isSubscribed: async (profileId: string, hashtagId: string) => {
    const { data, error } = await supabase
      .from('hashtag_subscriptions') 
      .select('id')
      .eq('profile_id', profileId)
      .eq('hashtag_id', hashtagId)
      .single();

    return { isSubscribed: !!data, error };
  },

  // Vérifier si un hashtag est bloqué
  isBlocked: async (profileId: string, hashtagId: string) => {
    const { data, error } = await supabase
      .from('hashtag_blocks') 
      .select('id')
      .eq('profile_id', profileId)
      .eq('hashtag_id', hashtagId)
      .single();

    return { isBlocked: !!data, error };
  },

  // Récupérer les hashtags suivis par un utilisateur
  getUserSubscriptions: async (profileId: string) => {
    const { data, error } = await supabase
      .from('hashtag_subscriptions') 
      .select(`
        id,
        hashtag_id,
        created_at,
        hashtags (
          id,
          name,
          usage_count
        )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Récupérer les hashtags bloqués par un utilisateur
  getUserBlocks: async (profileId: string) => {
    const { data, error } = await supabase
      .from('hashtag_blocks') // CORRIGÉ : minuscule avec underscore
      .select(`
        id,
        hashtag_id,
        created_at,
        hashtags (
          id,
          name,
          usage_count
        )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};