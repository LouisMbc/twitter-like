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
      console.error("Erreur lors de l'upload du fichier :", uploadError.message);
      return null;
    }

    const mediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stories/${filePath}`;

    // Ajouter durée par défaut pour les images (60s) et durée réelle pour les vidéos
    const storyDuration = duration || 60;

    // Ajout du log de débogage ici pour vérifier les données avant insertion
    console.log("Tentative d'insertion avec les données:", {
      user_id: userId,
      media_url: mediaUrl,
      media_type: mediaType,
      duration: storyDuration,
      content: ''
    });

    // Enregistrer dans la base de données
    const { data, error } = await supabase.from("Stories").insert([
      { 
        user_id: userId, 
        media_url: mediaUrl, 
        media_type: mediaType,
        duration: storyDuration, // Nouvelle colonne pour la durée
        content: '' // Champ obligatoire selon votre schéma
      }
    ]).select();

    // Log de débogage pour voir le résultat de l'insertion
    console.log("Résultat de l'insertion :", data, error);

    if (error) {
      console.error("Erreur lors de l'ajout de la story :", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erreur générale lors de l'ajout de la story :", error);
    return null;
  }
};

// 📌 Récupérer les Stories actives
export const getStories = async () => {
  try {
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
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des stories:", error);
    return [];
  }
};

// 📌 Supprimer une Story
export const deleteStory = async (storyId: string, mediaUrl: string) => {
  try {
    // Supprimer le fichier du storage
    const filePath = mediaUrl.split("/storage/v1/object/public/stories/")[1];

    await supabase.storage.from("stories").remove([filePath]);

    // Supprimer la story de la BDD
    const { error } = await supabase.from("Stories").delete().eq("id", storyId);

    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
  }
};