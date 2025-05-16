"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-browser';

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
            media_type
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
      <div className="w-full h-full">
        <img 
          src={story.media_url}
          alt="Story"
          className="rounded-lg object-cover w-full h-full"
        />
      </div>
    );
  } else if (story.media_type === 'video') {
    return (
      <div className="w-full h-full aspect-video">
        <video
          src={story.media_url}
          className="w-full h-full rounded-lg object-contain"
          controls
          autoPlay
          playsInline
          loop={false}
        />
      </div>
    );
  }

  return <div>Format non supporté</div>;
}