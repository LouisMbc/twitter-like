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
  const [media, setMedia] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string[]>([]);
  const [tweetCount, setTweetCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [reachedLimit, setReachedLimit] = useState(false);
  const [clientOnly, setClientOnly] = useState(false);

  useEffect(() => {
    // Set clientOnly to true after the component mounts
    setClientOnly(true);

    const checkTweetLimit = async () => {
      if (!profile) return;

      // Using type assertion to handle the property that doesn't exist in the type definition
      setIsPremium(!!(profile as any).isPremium || !!(profile as any).is_premium);

      // Check if user is premium before proceeding with tweet limit check
      if ((profile as any).isPremium || (profile as any).is_premium) return;

      // Create date object only on client-side
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

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      setError('Maximum 4 médias autorisés');
      return;
    }
    setMedia(files);

    // Créer les previews
    const previews = files.map(file => {
      // Si c'est une vidéo, on créé un élément vidéo pour la prévisualisation
      if (file.type.startsWith('video/')) {
        const videoUrl = URL.createObjectURL(file);
        return videoUrl;
      }
      // Sinon on traite comme une image
      return URL.createObjectURL(file);
    });
    setPreview(previews);
  };

  const uploadMedia = async (tweetId: string) => {
    console.log('[TweetComposer] Début de uploadMedia pour tweetId:', tweetId);
    const uploadPromises = media.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tweetId}/${Math.random()}.${fileExt}`;
      console.log('[TweetComposer] Tentative de téléversement du fichier:', fileName, 'vers le bucket: tweets');
      
      const { error: uploadError } = await supabase.storage
        .from('tweets')
        .upload(fileName, file, {
          cacheControl: "3600",
          contentType: file.type  // Ajouter cette ligne importante
        });

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

      let finalMediaUrls: string[] = [];
      if (media.length > 0) {
        console.log('[TweetComposer] handleSubmit - Téléversement des médias...');
        finalMediaUrls = await uploadMedia(tweet.id);
        console.log('[TweetComposer] handleSubmit - URLs des médias après téléversement:', finalMediaUrls);

        if (finalMediaUrls.length > 0) {
          console.log('[TweetComposer] handleSubmit - Mise à jour du tweet avec les URLs:', finalMediaUrls);
          const { error: updateError } = await supabase
            .from('Tweets')
            .update({ picture: finalMediaUrls })
            .eq('id', tweet.id);

          if (updateError) {
            console.error('[TweetComposer] handleSubmit - Erreur de mise à jour du tweet avec les médias:', updateError);
            throw updateError;
          }
          console.log('[TweetComposer] handleSubmit - Tweet mis à jour avec les médias.');
        } else if (media.length > 0 && finalMediaUrls.length === 0) {
          console.warn('[TweetComposer] handleSubmit - Des médias étaient sélectionnés mais aucune URL valide n\'a été obtenue après le téléversement.');
        }
      }
      
      setContent('');
      setMedia([]);
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

  if (!clientOnly) {
    return null;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded-lg shadow">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Quoi de neuf ?"
          className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
          rows={4}
          maxLength={280}
          required
        />

        {preview.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {preview.map((url, index) => (
              <div key={index} className="relative aspect-square">
                {media[index].type.startsWith('video/') ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover rounded"
                    controls
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMedia(media.filter((_, i) => i !== index));
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
              accept="image/*,video/*"
              multiple
              max={4}
              onChange={handleMediaChange}
              className="hidden"
              id="media-input"
            />
            <label
              htmlFor="media-input"
              className="cursor-pointer text-red-500 hover:text-red-400 transition-colors duration-200"
            >
              Ajouter des médias
            </label>
            <span className="text-sm text-gray-500">
              {content.length}/280
            </span>
          </div>
          <button
            type="submit"
            disabled={uploading || !content.trim()}
            className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {uploading ? 'Envoi...' : 'Tweeter'}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-red-500 text-sm">{error}</div>
        )}

        {clientOnly && !isPremium && (
          <div className="mt-2 text-sm text-gray-500 flex justify-between">
            <span>
              {tweetCount}/5 tweets aujourd'hui {reachedLimit && '(limite atteinte)'}
            </span>
            <a
              href="/premium"
              className="text-red-500 hover:text-red-400 transition-colors duration-200"
            >
              Passer à Premium pour des tweets illimités
            </a>
          </div>
        )}
      </form>

      {clientOnly && reachedLimit && (
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
