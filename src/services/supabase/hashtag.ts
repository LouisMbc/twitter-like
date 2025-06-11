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
  },  // Récupérer les tweets d'un hashtag
  getTweetsByHashtag: async (hashtagName: string, page = 0, limit = 20) => {
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
      .order('Tweets(published_at)', { ascending: false })
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
  },
  // Catégoriser un hashtag selon son contenu
  categorizeHashtag: (hashtagName: string): string => {
    const sports = ['football', 'sport', 'match', 'victoire', 'equipe', 'joueur', 'champion', 'coupe', 'ligue', 'basket', 'tennis', 'rugby'];
    const actualites = ['info', 'news', 'actualite', 'urgent', 'breaking', 'politique', 'economie', 'france', 'monde', 'gouvernement'];
    const divertissement = ['cinema', 'film', 'serie', 'musique', 'concert', 'festival', 'artiste', 'celebrity', 'tv', 'show', 'gaming', 'jeux'];
    
    const name = hashtagName.toLowerCase();
    
    if (sports.some(keyword => name.includes(keyword))) return 'Sport';
    if (actualites.some(keyword => name.includes(keyword))) return 'Actualités';
    if (divertissement.some(keyword => name.includes(keyword))) return 'Divertissement';
    
    return 'Tendances';
  },

  // Récupérer les hashtags tendances par catégorie
  getTrendingHashtagsByCategory: async (category = 'Tendances', limit = 10) => {
    const { data, error } = await supabase
      .from('tweet_hashtags')
      .select(`
        hashtag_id,
        hashtags!inner (
          id,
          name,
          usage_count
        ),
        Tweets!inner (
          view_count,
          published_at
        )
      `)
      .order('Tweets(view_count)', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des tendances:', error);
      return { data: [], error };
    }

    // Calculer les vues totales par hashtag
    const hashtagStats = new Map();
    
    data?.forEach(item => {
      const hashtagId = item.hashtag_id;
      const hashtagName = item.hashtags[0].name;
      const usageCount = item.hashtags[0].usage_count;
      const viewCount = item.Tweets[0].view_count || 0;
      const publishedAt = new Date(item.Tweets[0].published_at);
      
      // Calculer le facteur de récence (plus récent = score plus élevé)
      const now = new Date();
      const hoursAgo = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
      const recencyFactor = Math.max(0.1, 1 - (hoursAgo / 168)); // Décroît sur 7 jours

      if (hashtagStats.has(hashtagId)) {
        const existing = hashtagStats.get(hashtagId);
        existing.totalViews += viewCount;
        existing.tweetCount += 1;
        existing.recencyScore += recencyFactor;
      } else {
        hashtagStats.set(hashtagId, {
          id: hashtagId,
          name: hashtagName,
          usage_count: usageCount,
          totalViews: viewCount,
          tweetCount: 1,
          averageViews: viewCount,
          recencyScore: recencyFactor,
          category: hashtagService.categorizeHashtag(hashtagName)
        });
      }
    });

    // Filtrer par catégorie et calculer le score final
    const trendingHashtags = Array.from(hashtagStats.values())
      .filter(hashtag => category === 'Pour vous' || hashtag.category === category)
      .map(hashtag => ({
        ...hashtag,
        averageViews: hashtag.totalViews / hashtag.tweetCount,
        // Score amélioré avec récence, vues et engagement
        trendScore: (hashtag.totalViews * 0.5) + 
                   (hashtag.usage_count * 0.3) + 
                   (hashtag.recencyScore * 0.2)
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit);

    return { data: trendingHashtags, error: null };
  },

  // Récupérer les hashtags tendances basés sur les vues totales des tweets
  getTrendingHashtags: async (limit = 10) => {
    return hashtagService.getTrendingHashtagsByCategory('Tendances', limit);
  },

  // Récupérer toutes les catégories de tendances
  getAllTrendingCategories: async (limit = 10) => {
    const categories = ['Pour vous', 'Tendances', 'Actualités', 'Sport', 'Divertissement'];
    const results: { [key: string]: any[] } = {};

    for (const category of categories) {
      const { data } = await hashtagService.getTrendingHashtagsByCategory(category, limit);
      results[category] = data || [];
    }

    return results;
  },
};