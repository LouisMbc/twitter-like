import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface TweetComposerProps {
  onSuccess?: () => void;
}

export default function TweetComposer({ onSuccess }: TweetComposerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      setError('Maximum 4 images autorisées');
      return;
    }
    setImages(files);
    
    // Créer les previews
    const previews = files.map(file => URL.createObjectURL(file));
    setPreview(previews);
  };

  const uploadImages = async (tweetId: string) => {
    const uploadPromises = images.map(async (image) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${tweetId}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('tweets')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tweets')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      // Créer le tweet d'abord
      const { data: tweet, error: tweetError } = await supabase
        .from('Tweets')
        .insert([{
          content,
          author_id: profile.id,
          picture: [] // Sera mis à jour après l'upload
        }])
        .select()
        .single();

      if (tweetError) throw tweetError;

      // Upload les images si présentes
      if (images.length > 0) {
        const imageUrls = await uploadImages(tweet.id);
        
        // Mettre à jour le tweet avec les URLs des images
        const { error: updateError } = await supabase
          .from('Tweets')
          .update({ picture: imageUrls })
          .eq('id', tweet.id);

        if (updateError) throw updateError;
      }

      setContent('');
      setImages([]);
      setPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Appeler la fonction onSuccess si elle est fournie
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded-lg shadow">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Quoi de neuf ?"
        className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        maxLength={280}
        required
      />

      {/* Prévisualisation des images */}
      {preview.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {preview.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
              <button
                type="button"
                onClick={() => {
                  setImages(images.filter((_, i) => i !== index));
                  setPreview(preview.filter((_, i) => i !== index));
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            max={4}
            onChange={handleImageChange}
            className="hidden"
            id="image-input"
          />
          <label
            htmlFor="image-input"
            className="cursor-pointer text-blue-500 hover:text-blue-600"
          >
            📷 Ajouter des photos
          </label>
          <span className="text-sm text-gray-500">
            {content.length}/280
          </span>
        </div>
        <button
          type="submit"
          disabled={uploading || !content.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
        >
          {uploading ? 'Envoi...' : 'Tweeter'}
        </button>
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </form>
  );
}