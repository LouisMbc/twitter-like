"use client";

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase-browser';
import LogoLoader from '@/components/loader/loader';

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
          return;
        }

        setStory(data);
      } catch (error) {
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
        <LogoLoader size="small" />
      </div>
    );
  }

  if (!story) {
    return <div>Story non disponible</div>;
  }
  if (story.media_type === 'image') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 rounded-3xl overflow-hidden relative">
        <img 
          src={story.media_url}
          alt="Story"
          className="w-full h-full object-cover rounded-3xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
        {/* Overlay gradient pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 rounded-3xl"></div>
      </div>
    );
  } else if (story.media_type === 'video') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 rounded-3xl overflow-hidden relative">
        <video
          src={story.media_url}
          className="w-full h-full object-cover rounded-3xl"
          controls={false}
          autoPlay
          muted
          playsInline
          loop={false}
          preload="metadata"
          onError={(e) => {
          }}
          onLoadStart={() => {
          }}
          onCanPlay={() => {
          }}
        />
        {/* Overlay gradient pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 rounded-3xl"></div>
      </div>
    );
  }

  return <div>Format non supporté</div>;
}