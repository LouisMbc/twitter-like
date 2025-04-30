import { supabase } from '@/lib/supabaseClient';

class ProfileService {
  /**
   * Get a user's profile by their ID
   */
  async getUserProfile(userId: string) {
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  }

  /**
   * Get tweets from a specific user
   */
  async getUserTweets(profileId: string) {
    return await supabase
      .from('tweets')
      .select('*, profiles(*)')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
  }

  /**
   * Get comments from a specific user
   */
  async getUserComments(profileId: string) {
    return await supabase
      .from('comments')
      .select('*, profiles(*), tweets(*)')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
  }
}

const profileService = new ProfileService();
export default profileService;
