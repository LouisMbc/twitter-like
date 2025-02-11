"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function CreateTweetPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const uploadImages = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `tweets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('tweets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('tweets')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      // D'abord récupérer l'ID du profil de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profil non trouvé');

      // Upload des images si présentes
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      // Créer le tweet avec l'ID du profil comme author_id
      const { error: tweetError } = await supabase
        .from('Tweets')
        .insert([
          {
            content,
            picture: imageUrls,
            author_id: profileData.id // Utiliser l'ID du profil au lieu de session.user.id
          }
        ]);

      if (tweetError) throw tweetError;

      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Créer un tweet</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contenu du tweet */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Quoi de neuf ?"
            className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            maxLength={280}
            required
          />
          <div className="text-sm text-gray-500 text-right">
            {content.length}/280 caractères
          </div>
        </div>

        {/* Upload d'images */}
        <div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Prévisualisation des images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={uploading || !content.trim()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg
            hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Publication...' : 'Tweeter'}
        </button>
      </form>
    </div>
  );
}