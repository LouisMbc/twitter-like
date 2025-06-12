import supabase from '@/lib/supabase';

export const addStory = async (
  userId: string, 
  file: File, 
  mediaType: 'image' | 'video',
  duration?: number // Durée personnalisée en secondes
) => {
  try {
    // Utiliser le fichier tel quel, sans conversion
    const fileExt = file.name.split('.').pop();
    const filePath = `stories/${userId}/${Date.now()}.${fileExt}`;

    // Upload du fichier
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

    // Ajouter durée par défaut pour les images (60s) et durée réelle pour les vidéos
    const storyDuration = duration || 60;
    
    // Calcul de la date d'expiration (24 heures après création)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Enregistrer dans la base de données
    const { data, error } = await supabase.from("Stories").insert([
      { 
        user_id: userId, 
        media_url: mediaUrl, 
        media_type: mediaType,
        duration: storyDuration,
        content: '', // Champ obligatoire selon votre schéma
        expires_at: expiresAt.toISOString() // Ajout de la date d'expiration
      }
    ]).select();

    if (error) {
      return null;
    }

    if (data) {
      return data[0].id; // Retourner l'ID de la story créée
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// 📌 Récupérer les Stories actives
export const getStories = async () => {
  try {
    // Calculer la date limite (24 heures en arrière)
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
      .gte('created_at', twentyFourHoursAgo.toISOString()) // Filtrer par date
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
};

// 📌 Supprimer une Story
export const deleteStory = async (storyId: string, mediaUrl: string) => {
  try {
    // Extraire le chemin du fichier à partir de l'URL
    const urlParts = mediaUrl.split('/');
    const filePath = urlParts.slice(urlParts.indexOf('stories')).join('/');
    
    // Supprimer le fichier du stockage
    const { error: deleteStorageError } = await supabase.storage
      .from('stories')
      .remove([filePath]);
    
    if (deleteStorageError) {
    }
    
    // Supprimer l'entrée de la base de données
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