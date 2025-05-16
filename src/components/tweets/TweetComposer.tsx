"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

interface TweetComposerProps {
  onSuccess?: () => void;
}

export default function TweetComposer({ onSuccess }: TweetComposerProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string[]>([]);
  const [tweetCount, setTweetCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [reachedLimit, setReachedLimit] = useState(false);

  useEffect(() => {
    const checkTweetLimit = async () => {
      if (!profile) return;

      setIsPremium(!!profile.is_premium);

      if (profile.is_premium) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('Tweets')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profile.id)
        .gte('published_at', today.toISOString());

      if (error) {
        console.error('Erreur lors de la vérification de la limite de tweets:', error);
        return;
      }

      setTweetCount(count ?? 0);
      setReachedLimit((count ?? 0) >= 5);
    };

    checkTweetLimit();
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      setError('Maximum 4 images autorisées');
      return;
    }
    setImages(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setPreview(previews);
  };

  const uploadImages = async (tweetId: string) => {
    console.log('[TweetComposer] Début de uploadImages pour tweetId:', tweetId);
    const uploadPromises = images.map(async (image) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${tweetId}/${Math.random()}.${fileExt}`;
      console.log('[TweetComposer] Tentative de téléversement du fichier:', fileName, 'vers le bucket: tweets');
      
      const { error: uploadError } = await supabase.storage
        .from('tweets') // Confirmé comme étant le bon nom de bucket
        .upload(fileName, image);

      if (uploadError) {
        console.error('[TweetComposer] Erreur de téléversement Supabase Storage:', uploadError);
        // Il est important de ne pas continuer si le téléversement échoue
        // et de peut-être retourner null ou une indication d'erreur.
        return null; 
      }
      console.log('[TweetComposer] Fichier téléversé avec succès:', fileName);

      const { data: urlData } = supabase.storage
        .from('tweets')
        .getPublicUrl(fileName);
      
      console.log('[TweetComposer] URL publique obtenue:', urlData.publicUrl);
      if (!urlData.publicUrl) {
        console.error('[TweetComposer] L\'URL publique est vide pour:', fileName);
      }
      return urlData.publicUrl;
    });

    // Attendre que toutes les promesses de téléversement soient résolues
    const urls = await Promise.all(uploadPromises);
    // Filtrer les URLs nulles si le téléversement a échoué pour certaines images
    const validUrls = urls.filter(url => url !== null) as string[];
    console.log('[TweetComposer] URLs valides après téléversement:', validUrls);
    return validUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    console.log('[TweetComposer] handleSubmit - Début');

    if (!isPremium && tweetCount >= 5) {
      setError("Vous avez atteint votre limite de tweets pour aujourd'hui. Passez à Premium pour des tweets illimités !");
      setUploading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');
      
      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');
      console.log('[TweetComposer] handleSubmit - Profil ID:', profile.id);

      console.log('[TweetComposer] handleSubmit - Insertion du tweet initial (sans images)...');
      const { data: tweet, error: tweetError } = await supabase
        .from('Tweets')
        .insert([{
          content,
          author_id: profile.id,
          picture: [] // Initialement vide
        }])
        .select()
        .single();

      if (tweetError) {
        console.error('[TweetComposer] handleSubmit - Erreur d\'insertion du tweet:', tweetError);
        throw tweetError;
      }
      console.log('[TweetComposer] handleSubmit - Tweet inséré avec ID:', tweet.id);

      let finalImageUrls: string[] = [];
      if (images.length > 0) {
        console.log('[TweetComposer] handleSubmit - Téléversement des images...');
        finalImageUrls = await uploadImages(tweet.id); // Appel de la fonction uploadImages
        console.log('[TweetComposer] handleSubmit - URLs des images après téléversement:', finalImageUrls);

        if (finalImageUrls.length > 0) {
          console.log('[TweetComposer] handleSubmit - Mise à jour du tweet avec les URLs:', finalImageUrls);
          const { error: updateError } = await supabase
            .from('Tweets')
            .update({ picture: finalImageUrls }) // Utiliser les URLs valides
            .eq('id', tweet.id);

          if (updateError) {
            console.error('[TweetComposer] handleSubmit - Erreur de mise à jour du tweet avec les images:', updateError);
            throw updateError;
          }
          console.log('[TweetComposer] handleSubmit - Tweet mis à jour avec les images.');
        } else if (images.length > 0 && finalImageUrls.length === 0) {
          console.warn('[TweetComposer] handleSubmit - Des images étaient sélectionnées mais aucune URL valide n\'a été obtenue après le téléversement.');
        }
      }
      // ... (réinitialisation des états, redirection, etc.) ...
      setContent('');
      setImages([]);
      setPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTweetCount(prev => prev + 1);
      setReachedLimit(tweetCount + 1 >= 5);

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }

    } catch (err) {
      console.error('[TweetComposer] handleSubmit - Erreur catchée:', err);
      setError((err as Error).message);
    } finally {
      setUploading(false);
      console.log('[TweetComposer] handleSubmit - Fin');
    }
  };

  return (
    <div>
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

        {!isPremium && (
          <div className="mt-2 text-sm text-gray-500 flex justify-between">
            <span>
              {tweetCount}/5 tweets aujourd'hui {reachedLimit && '(limite atteinte)'}
            </span>
            <a
              href="/premium"
              className="text-blue-500 hover:underline"
            >
              Passer à Premium pour des tweets illimités
            </a>
          </div>
        )}
      </form>

      {reachedLimit && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-semibold text-yellow-800">Limite de tweets atteinte</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Vous avez utilisé vos 5 tweets quotidiens gratuits. Passez à Premium pour des tweets illimités et d'autres avantages !
          </p>
          <a
            href="/premium"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Découvrir Premium
          </a>
        </div>
      )}
    </div>
  );
}