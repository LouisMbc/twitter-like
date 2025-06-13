"use client";

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase-browser';
import LogoLoader from '@/components/loader/loader';
import Image from 'next/image';

interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  content: string;
}

interface StoryMediaProps {
  storyId: string;
}

export default function StoryMedia({ storyId }: StoryMediaProps) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchStory = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('Stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (fetchError) throw fetchError;
        setStory(data);
      } catch (err) {
        console.error('Error fetching story:', err);
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
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        Story non trouvée
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {story.media_type === 'video' ? (
        <video
          src={story.media_url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <Image
          src={story.media_url}
          alt="Story"
          fill
          className="object-cover"
          onError={() => {
            console.error('Failed to load story image');
          }}
        />
      )}
      
      {story.content && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-center">{story.content}</p>
        </div>
      )}
    </div>
  );
}