"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { hashtagService } from '@/services/supabase/hashtag';
import { mentionService } from '@/services/supabase/mention';
import MentionTextarea from '@/components/mentions/MentionTextarea';
import Image from 'next/image';

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
    setClientOnly(true);

    const checkTweetLimit = async () => {
      if (!profile) return;

      const profileData = profile as {
        id: string;
        isPremium?: boolean;
        is_premium?: boolean;
      };

      setIsPremium(!!(profileData.isPremium || profileData.is_premium));

      if (profileData.isPremium || profileData.is_premium) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('Tweets')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profile.id)
        .gte('published_at', today.toISOString());

      if (error) {
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

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi)$/i.test(file.name);
      return isImage || isVideo;
    });

    if (validFiles.length !== files.length) {
      setError('Seules les images et vidéos sont autorisées');
      return;
    }

    setMedia(validFiles);
    setError('');

    const previews = validFiles.map(file => {
      return URL.createObjectURL(file);
    });
    setPreview(previews);
  };

  const uploadMedia = async (tweetId: string) => {
    if (media.length === 0) return [];
    
    const uploadPromises = media.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tweetId}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('tweets')
        .upload(fileName, file, {
          cacheControl: "3600",
          contentType: file.type || 'application/octet-stream'
        });

      if (uploadError) {
        return null; 
      }

      const { data: urlData } = supabase.storage
        .from('tweets')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(url => url !== null) as string[];
    return validUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setUploading(true);
    setError('');

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

      const { data: tweet, error: tweetError } = await supabase
        .from('Tweets')
        .insert([{
          content,
          author_id: profile.id,
          picture: []
        }])
        .select()
        .single();

      if (tweetError) {
        throw tweetError;
      }

      // Gérer les hashtags
      try {
        const hashtagNames = hashtagService.extractHashtags(content);
        
        if (hashtagNames.length > 0) {
          const hashtags = await hashtagService.createOrGetHashtags(hashtagNames);
          
          if (hashtags.length > 0) {
            const hashtagIds = hashtags.map(h => h.id);
            await hashtagService.linkHashtagsToTweet(tweet.id, hashtagIds);
          }
        }
      } catch (err) {
        console.error('Error processing hashtags:', err);
      }

      // Gérer les mentions
      try {
        const mentions = mentionService.extractMentions(content);
        
        if (mentions.length > 0) {
          await mentionService.createMentionNotifications(tweet.id, profile.id, mentions);
        }
      } catch (err) {
        console.error('Error processing mentions:', err);
      }

      let finalMediaUrls: string[] = [];
      if (media.length > 0) {
        finalMediaUrls = await uploadMedia(tweet.id);
        
        if (finalMediaUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('Tweets')
            .update({ picture: finalMediaUrls })
            .eq('id', tweet.id);

          if (updateError) {
            throw updateError;
          }
        } else if (media.length > 0 && finalMediaUrls.length === 0) {
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
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const renderTextWithHashtags = (text: string) => {
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-red-500 font-medium">
            {part}
          </span>
        );
      } else if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-500 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (!clientOnly) {
    return null;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded-lg shadow">
        <div className="relative">
          <MentionTextarea
            value={content}
            onChange={setContent}
            placeholder="Quoi de neuf ? Utilisez # pour les hashtags et @ pour mentionner"
            className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
          />
          
          {content && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <span className="text-gray-600">Aperçu: </span>
              {renderTextWithHashtags(content)}
            </div>
          )}
        </div>

        {preview.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {preview.map((url, index) => (
              <div key={index} className="relative aspect-square">
                {media[index].type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi)$/i.test(media[index].name) ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover rounded"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded"
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
              accept="image/*,video/*,.mp4,.webm,.ogg,.mov,.avi"
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
              {tweetCount}/5 tweets aujourd&apos;hui {reachedLimit && '(limite atteinte)'}
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
            Vous avez utilisé vos 5 tweets quotidiens gratuits. Passez à Premium pour des tweets illimités et d&apos;autres avantages !
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
