import { Profile, Tweet, Comment } from '@/types';
import supabase from '@/lib/supabase';

export const profileService = {
  updateProfile: async (userId: string, data: Partial<Profile>) => {
    const { error } = await supabase
      .from('Profile')
      .update(data)
      .eq('user_id', userId);
    return { error };
  },

  uploadProfilePicture: async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('Profile')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  },

  createProfile: async (userId: string, profileData: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('Profile')
      .insert([{
        user_id: userId,
        ...profileData
      }])
      .select()
      .single();
      
    return { data, error };
  },

  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('Profile')
      .select('*, follower_count, following_count')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  getUserTweets: async (profileId: string) => {
    const { data, error } = await supabase
      .from('Tweets')
      .select(`
        id,
        content,
        picture,
        published_at,
        view_count,
        retweet_id,
        author:Profile!author_id (id, nickname, profilePicture)
      `)
      .eq('author_id', profileId)
      .order('published_at', { ascending: false });
    return { data, error };
  },

  getUserComments: async (profileId: string) => {
    const { data, error } = await supabase
      .from('Comments')
      .select(`
        id,
        content,
        created_at,
        tweet:tweet_id ( id, content ),
        author:author_id (
          id,
          nickname,
          profilePicture
        )
      `)
      .eq('author_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
    }
    
    return { data, error };
  }
};