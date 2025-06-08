// src/app/tweets/retweet/[tweetId]/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { tweetService } from '@/services/supabase/tweet';
import TweetCard from '@/components/tweets/TweetCard';
import { Tweet } from '@/types';
import Header from '@/components/shared/Header';
import { FaImage, FaTimes } from 'react-icons/fa';

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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }
        
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
      setError('Maximum 4 médias autorisés');
      return;
    }

    // Validation des types de fichiers
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi)$/i.test(file.name);
      return isImage || isVideo;
    });

    if (validFiles.length !== files.length) {
      setError('Seules les images et vidéos sont autorisées');
      return;
    }

    setImages(validFiles);
    setError('');
    
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setPreview(previews);
  };

  const uploadImages = async (tweetId: string) => {
    if (images.length === 0) return [];
    
    const uploadPromises = images.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tweetId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tweets')
        .upload(fileName, file, {
          cacheControl: "3600",
          contentType: file.type || 'application/octet-stream'
        });

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

      if (images.length > 0) {
        const imageUrls = await uploadImages(tweet.id);
        
        const { error: updateError } = await supabase
          .from('Tweets')
          .update({ picture: imageUrls })
          .eq('id', tweet.id);

        if (updateError) throw updateError;
      }

      router.push('/dashboard');
      
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <div className="mt-6 text-lg font-semibold">Chargement du tweet...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="bg-gray-900 rounded-xl p-6 max-w-lg mx-auto text-center">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <button 
            onClick={() => router.back()} 
            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Header />
      
      <div className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-800">
              <FaTimes className="text-red-500" size={18} />
            </button>
            <h1 className="text-2xl font-bold">Retweeter</h1>
          </div>
          
          {originalTweet && (
            <div className="border border-gray-700 rounded-xl bg-gray-900 mb-4 overflow-hidden">
              <div className="p-2 bg-gray-800 text-sm text-gray-400">Tweet original</div>
              <TweetCard 
                tweet={originalTweet} 
                detailed={true}
                showRetweetButton={false}
              />
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mb-4 bg-gray-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full p-4 bg-gray-800 text-white border border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:outline-none"
                rows={3}
                maxLength={280}
              />

              {preview.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {preview.map((url, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden aspect-square bg-gray-800">
                      {images[index].type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi)$/i.test(images[index].name) ? (
                        <video
                          src={url}
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setImages(images.filter((_, i) => i !== index));
                          setPreview(preview.filter((_, i) => i !== index));
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 bg-gray-900 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.mp4,.webm,.ogg,.mov,.avi"
                  multiple
                  max={4}
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className="p-2 rounded-full hover:bg-gray-800 text-red-500 cursor-pointer flex items-center transition-colors"
                >
                  <FaImage size={20} />
                </label>
                {content && (
                  <span className={`text-sm ${content.length > 260 ? 'text-yellow-500' : 'text-gray-400'}`}>
                    {content.length}/280
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-red-600 font-medium text-white rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Envoi...' : 'Retweeter'}
              </button>
            </div>
            
            {error && (
              <div className="px-4 py-2 bg-red-900 bg-opacity-30 text-red-500 text-sm">{error}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}