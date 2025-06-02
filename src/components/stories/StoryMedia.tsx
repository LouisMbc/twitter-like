"use client";

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase-browser';

interface StoryMediaProps {
  storyId: string;
}

export default function StoryMedia({ storyId }: StoryMediaProps) {
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchStory = async () => {
      try {
        const { data, error } = await supabase
          .from("Stories")
          .select(`
            media_url,
            media_type,
            Profile:user_id (
              profilePicture,
              nickname
            )
          `)
          .eq('id', storyId)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération de la story:", error);
          return;
        }

        setStory(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  // Don't render anything on the server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!story) {
    return <div>Story non disponible</div>;
  }
  if (story.media_type === 'image') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden">
        <img 
          src={story.media_url}
          alt="Story"
          className="max-w-full max-h-full object-contain rounded-2xl"
          onError={(e) => {
            console.error('Erreur de chargement de l\'image:', e);
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
      </div>
    );
  } else if (story.media_type === 'video') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden">
        <video
          src={story.media_url}
          className="w-full h-full object-cover rounded-2xl"
          controls={false}
          autoPlay
          muted
          playsInline
          loop={false}
          preload="metadata"
          onError={(e) => {
            console.error('Erreur de chargement de la vidéo:', e);
          }}
          onLoadStart={() => {
            console.log('Début du chargement de la vidéo');
          }}
          onCanPlay={() => {
            console.log('Vidéo prête à être lue');
          }}
        />
      </div>
    );
  }

  return <div>Format non supporté</div>;
}