import supabase from '@/lib/supabase';
import { notificationService } from '@/services/supabase/notification';

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

    // Si la story est créée avec succès, créer des notifications pour les abonnés
    if (data) {
      // Récupérer les followers pour envoyer des notifications
      const { data: followers } = await supabase
        .from('Following')
        .select('follower_id')
        .eq('following_id', userId);
      
      if (followers && followers.length > 0) {
        // Récupérer les informations sur l'auteur pour le message
        const { data: authorData } = await supabase
          .from('Profile')
          .select('nickname')
          .eq('id', userId)
          .single();
        
        const authorName = authorData ? authorData.nickname : 'Un utilisateur';
        
        // Créer une notification pour chaque follower
        const notificationPromises = followers.map(follower => 
          notificationService.createNotification({
            user_id: follower.follower_id,
            sender_id: userId,
            content_id: data[0].id,
            content_type: 'story',
            type: 'new_story',
            message: `a publié une nouvelle story`
          })
        );
        
        await Promise.all(notificationPromises);
      }
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