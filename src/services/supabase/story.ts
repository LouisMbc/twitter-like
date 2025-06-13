import supabase from '@/lib/supabase';

// Fonction pour compresser une image
const compressImage = (file: File, maxWidth: number = 1080, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dessiner l'image redimensionnée
      ctx!.drawImage(img, 0, 0, width, height);
      
      // Convertir en blob puis en fichier
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback vers le fichier original
        }
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Fonction pour valider et traiter le fichier
const processMediaFile = async (file: File): Promise<{ processedFile: File; error?: string }> => {
  const maxImageSize = 10 * 1024 * 1024; // 10MB pour les images
  const maxVideoSize = 50 * 1024 * 1024; // 50MB pour les vidéos
  
  // Vérifier le type de fichier
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return { processedFile: file, error: 'Format de fichier non supporté. Utilisez des images ou des vidéos.' };
  }
  
  // Pour les vidéos, vérifier directement la taille
  if (file.type.startsWith('video/')) {
    if (file.size > maxVideoSize) {
      return { processedFile: file, error: 'La vidéo est trop volumineuse. Taille maximum: 50MB.' };
    }
    return { processedFile: file };
  }
  
  // Pour les images, compresser si nécessaire
  if (file.type.startsWith('image/')) {
    if (file.size > maxImageSize) {
      try {
        const compressedFile = await compressImage(file, 1080, 0.7);
        if (compressedFile.size > maxImageSize) {
          // Si encore trop gros, compresser davantage
          const moreCompressed = await compressImage(file, 720, 0.5);
          if (moreCompressed.size > maxImageSize) {
            return { processedFile: file, error: 'Impossible de compresser l\'image suffisamment. Veuillez choisir une image plus petite.' };
          }
          return { processedFile: moreCompressed };
        }
        return { processedFile: compressedFile };
      } catch (error) {
        console.error('Erreur lors de la compression:', error);
        return { processedFile: file, error: 'Erreur lors de la compression de l\'image.' };
      }
    }
    return { processedFile: file };
  }
  
  return { processedFile: file };
};

export const addStory = async (
  userId: string, 
  file: File, 
  mediaType: 'image' | 'video',
  duration?: number
) => {
  try {
    // Process the media file
    const { processedFile, error: processError } = await processMediaFile(file);
    
    if (processError) {
      throw new Error(processError);
    }
    
    const fileExt = processedFile.name.split('.').pop();
    const filePath = `stories/${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("stories")
      .upload(filePath, processedFile, { 
        cacheControl: "3600", 
        upsert: false,
        contentType: processedFile.type
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