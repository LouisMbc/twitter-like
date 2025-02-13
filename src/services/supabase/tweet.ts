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
  }
};