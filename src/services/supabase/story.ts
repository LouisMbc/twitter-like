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
  const maxSize = 50 * 1024 * 1024; // 50MB limite Supabase
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
  duration?: number // Durée personnalisée en secondes
) => {
  try {
    // Traiter le fichier (compression si nécessaire)
    const { processedFile, error: processError } = await processMediaFile(file);
    
    if (processError) {
      console.error("Erreur lors du traitement du fichier :", processError);
      alert(processError); // Afficher l'erreur à l'utilisateur
      return null;
    }
    
    console.log(`Fichier traité: ${file.size} bytes -> ${processedFile.size} bytes`);
    
    const fileExt = processedFile.name.split('.').pop();
    const filePath = `stories/${userId}/${Date.now()}.${fileExt}`;

    // Upload du fichier traité
    const { error: uploadError } = await supabase.storage
      .from("stories")
      .upload(filePath, processedFile, { 
        cacheControl: "3600", 
        upsert: false,
        contentType: processedFile.type
      });

    if (uploadError) {
      console.error("Erreur lors de l'upload du fichier :", uploadError.message);
      
      // Messages d'erreur plus spécifiques
      if (uploadError.message.includes("exceeded the maximum allowed size")) {
        alert("Le fichier est trop volumineux. Veuillez choisir un fichier plus petit.");
      } else if (uploadError.message.includes("Invalid file type")) {
        alert("Format de fichier non supporté.");
      } else {
        alert("Erreur lors de l'upload. Veuillez réessayer.");
      }
      
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
      console.error("Erreur lors de l'ajout de la story :", error.message);
      return null;
    }

    if (data) {
      return data[0].id; // Retourner l'ID de la story créée
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la story :", error);
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
    // Extraire le chemin du fichier à partir de l'URL
    const urlParts = mediaUrl.split('/');
    const filePath = urlParts.slice(urlParts.indexOf('stories')).join('/');
    
    // Supprimer le fichier du stockage
    const { error: deleteStorageError } = await supabase.storage
      .from('stories')
      .remove([filePath]);
    
    if (deleteStorageError) {
      console.error('Erreur lors de la suppression du fichier média:', deleteStorageError);
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
    console.error('Erreur lors de la suppression de la story:', error);
    throw error;
  }
};