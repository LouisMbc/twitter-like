import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import supabase from '@/lib/supabase';

// Fonction pour convertir la vidéo en MP4
const convertToMp4 = async (file: File): Promise<File> => {
  if (file.type === 'video/mp4') return file;

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  // Charger le fichier
  const inputFileName = 'input.' + file.name.split('.').pop();
  const outputFileName = 'output.mp4';
  ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));

  // Convertir en MP4
  await ffmpeg.run(
    '-i', inputFileName,
    '-c:v', 'libx264',
    '-crf', '23',
    '-preset', 'medium',
    '-c:a', 'aac',
    '-b:a', '128k',
    outputFileName
  );

  // Lire le fichier converti
  const data = ffmpeg.FS('readFile', outputFileName);
  
  // Nettoyer
  ffmpeg.FS('unlink', inputFileName);
  ffmpeg.FS('unlink', outputFileName);

  // Créer un nouveau fichier
  return new File([data.buffer], outputFileName, { type: 'video/mp4' });
};

export const addStory = async (userId: string, file: File, mediaType: 'image' | 'video') => {
  try {
    // Convertir la vidéo si nécessaire
    let fileToUpload = file;
    if (mediaType === 'video' && file.type !== 'video/mp4') {
      fileToUpload = await convertToMp4(file);
    }

    const fileExt = mediaType === 'video' ? 'mp4' : file.name.split('.').pop();
    const filePath = `stories/${userId}/${Date.now()}.${fileExt}`;

    // Upload du fichier
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("stories")
      .upload(filePath, fileToUpload, { 
        cacheControl: "3600", 
        upsert: false,
        contentType: mediaType === 'video' ? 'video/mp4' : file.type 
      });

    if (uploadError) {
      console.error("Erreur lors de l'upload du fichier :", uploadError.message);
      return null;
    }

    const mediaUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stories/${filePath}`;

    // Enregistrer dans la base de données
    const { data, error } = await supabase.from("Stories").insert([
      { 
        user_id: userId, 
        media_url: mediaUrl, 
        media_type: mediaType 
      }
    ]);

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
  const { data, error } = await supabase
    .from("Stories")
    .select("id, user_id, media_url, media_type, created_at")
    .gte("expires_at", new Date().toISOString()) // Stories non expirées
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des stories :", error);
    return [];
  }
  return data;
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
