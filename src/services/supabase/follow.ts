import supabase from '@/lib/supabase';

export const followService = {
  async getFollowings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error fetching followings:', error);
      return { data: null, error };
    }
  },

  async getFollowers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error fetching followers:', error);
      return { data: null, error };
    }
  },

  async followUser(followerId: string, followingId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .insert([{ follower_id: followerId, following_id: followingId }]);

      return { data, error };
    } catch (error) {
      console.error('Error following user:', error);
      return { data: null, error };
    }
  },

  async unfollowUser(followerId: string, followingId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      return { data, error };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { data: null, error };
    }
  },

  async isFollowing(followerId: string, followingId: string) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      return { isFollowing: !!data, error };
    } catch (error) {
      return { isFollowing: false, error };
    }
  }
};