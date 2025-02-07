"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface Tweet {
  content: string;
  picture: string[];
}

export default function CreateTweetPage() {
  const router = useRouter();
  const [tweet, setTweet] = useState<Tweet>({
    content: '',
    picture: [], 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Vérification du contenu
      if (!tweet.content.trim()) {
        throw new Error('Le contenu du tweet ne peut pas être vide');
      }

      const { error: tweetError } = await supabase
        .from('tweets')
        .insert([
          {
            content: tweet.content,
            picture: tweet.picture,
            // author_id sera automatiquement défini par Supabase RLS
            // published_at sera automatiquement défini par défaut
            // view_count sera initialisé à 0 par défaut
          }
        ]);

      if (tweetError) throw tweetError;

      // Redirection vers le dashboard après création
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Créer un Tweet</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contenu du tweet */}
        <div>
          <textarea
            value={tweet.content}
            onChange={(e) => setTweet(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Quoi de neuf ?"
            className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            maxLength={280}
          />
          <div className="text-sm text-gray-500 text-right">
            {tweet.content.length}/280 caractères
          </div>
        </div>

        {/* Upload d'images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ajouter des photos
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = e.target.files;
              if (!files) return;

              // Upload des images vers Supabase Storage
              const uploadedUrls = await Promise.all(
                Array.from(files).map(async (file) => {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Math.random()}.${fileExt}`;
                  const filePath = `tweets/${fileName}`;

                  const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, file);

                  if (uploadError) throw uploadError;

                  const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                  return publicUrl;
                })
              );

              setTweet(prev => ({
                ...prev,
                picture: [...prev.picture, ...uploadedUrls]
              }));
            }}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Prévisualisation des images */}
        {tweet.picture.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {tweet.picture.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !tweet.content.trim()}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg
            hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Publication...' : 'Tweeter'}
        </button>
      </form>
    </div>
  );
}