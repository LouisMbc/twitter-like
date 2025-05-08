// src/app/tweets/retweet/[tweetId]/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { tweetService } from '@/services/supabase/tweet';
import TweetCard from '@/components/tweets/TweetCard';
import { Tweet } from '@/types';

export default function RetweetPage() {
  const params = useParams();
  const router = useRouter();
  const tweetId = params.tweetId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [content, setContent] = useState('');
  const [originalTweet, setOriginalTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTweet = async () => {
      try {
        setLoading(true);
        // Vérifier l'authentification
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }
        
        // Obtenir l'ID du profil
        const { data: profileData } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (!profileData) {
          setError("Profil non trouvé");
          return;
        }
        
        setProfileId(profileData.id);
        
        // Récupérer le tweet original
        const { data, error } = await tweetService.getTweetById(tweetId);
        if (error) throw error;
        if (!data) throw new Error("Tweet non trouvé");
        
        setOriginalTweet(data);
      } catch (err) {
        setError("Erreur lors du chargement du tweet");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTweet();
  }, [tweetId, router]);

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
    if (images.length === 0) return [];
    
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
    if (!profileId || !originalTweet) return;
    
    try {
      setSubmitting(true);
      
      // Créer le retweet avec commentaire
      const { data: tweet, error: tweetError } = await supabase
        .from('Tweets')
        .insert([{
          content,
          author_id: profileId,
          retweet_id: tweetId,
          picture: []
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

      // Rediriger vers la page d'accueil
      router.push('/dashboard');
      
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Retweeter</h1>
      
      <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded-lg shadow">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          maxLength={280}
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
            {content && (
              <span className="text-sm text-gray-500">
                {content.length}/280
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
          >
            {submitting ? 'Envoi...' : 'Retweeter'}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-red-500 text-sm">{error}</div>
        )}
      </form>
      
      {/* Tweet original */}
      {originalTweet && (
        <div className="border border-gray-200 rounded-lg">
          <TweetCard 
            tweet={originalTweet} 
            detailed={true}
            showRetweetButton={false} // Ne pas afficher le bouton Retweeter ici
          />
        </div>
      )}
    </div>
  );
}