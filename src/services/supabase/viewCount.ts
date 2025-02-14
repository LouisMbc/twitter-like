import supabase from '@/lib/supabase';

export const viewService = {
  incrementView: async (contentId: string, contentType: 'tweet' | 'comment', viewerId?: string, ipAddress?: string, userAgent?: string) => {
    try {
      // Vérifier si c'est une vue unique
      const { data: existingView } = await supabase
        .from('ViewTracking')
        .select()
        .match({
          content_id: contentId,
          content_type: contentType,
          ...(viewerId ? { viewer_id: viewerId } : { ip_address: ipAddress, user_agent: userAgent })
        })
        .gte('viewed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24h
        .single();

      if (existingView) return { error: null };

      // Insérer le suivi de vue
      await supabase.from('ViewTracking').insert({
        content_id: contentId,
        content_type: contentType,
        viewer_id: viewerId,
        ip_address: ipAddress,
        user_agent: userAgent
      });

      // Incrémenter le compteur
      const { error } = await supabase.rpc('increment_view_count', {
        p_content_id: contentId,
        p_content_type: contentType
      });

      return { error };
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
      return { error };
    }
  },

  getViewCount: async (contentId: string, contentType: 'tweet' | 'comment') => {
    const { data, error } = await supabase
      .from(contentType === 'tweet' ? 'Tweets' : 'Comments')
      .select('view_count')
      .eq('id', contentId)
      .single();

    return { count: data?.view_count || 0, error };
  }
};