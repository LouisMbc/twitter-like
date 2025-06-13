import supabase from '@/lib/supabase';

export const addStory = async (
  userId: string, 
  file: File, 
  mediaType: 'image' | 'video',
  duration?: number
) => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `stories/${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("stories")
      .upload(filePath, file, { 
        cacheControl: "3600", 
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      return null;
    }

    const mediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stories/${filePath}`;

    const storyDuration = duration || 60;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data, error } = await supabase.from("Stories").insert([
      { 
        user_id: userId, 
        media_url: mediaUrl, 
        media_type: mediaType,
        duration: storyDuration,
        content: '',
        expires_at: expiresAt.toISOString()
      }
    ]).select();

    if (error) {
      return null;
    }

    if (data) {
      return data[0].id;
    }
    
    return null;
  } catch {
    return null;
  }
};

// 📌 Récupérer les Stories actives
export const getStories = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data, error } = await supabase
      .from("Stories")
      .select(`
        id,
        user_id,
        content,
        media_url,
        media_type,
        created_at,
        Profile(id, nickname, profilePicture)
      `)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
};

// 📌 Supprimer une Story
export const deleteStory = async (storyId: string, mediaUrl: string) => {
  try {
    const urlParts = mediaUrl.split('/');
    const filePath = urlParts.slice(urlParts.indexOf('stories')).join('/');
    
    const { error: deleteStorageError } = await supabase.storage
      .from('stories')
      .remove([filePath]);
    
    if (deleteStorageError) {
      // Log supprimé pour la production
    }
    
    const { error: deleteDbError } = await supabase
      .from('Stories')
      .delete()
      .eq('id', storyId);
    
    if (deleteDbError) {
      throw deleteDbError;
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};