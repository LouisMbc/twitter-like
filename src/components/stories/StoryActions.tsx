// src/components/stories/StoryActions.tsx
import { useState } from 'react';
import supabase from '@/lib/supabase';
import { deleteStory } from '@/services/supabase/story';

interface StoryActionsProps {
  storyId: string;
  mediaUrl: string;
  onDelete?: () => void;
}

export default function StoryActions({ storyId, mediaUrl, onDelete }: StoryActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cette story ?')) return;
    
    setLoading(true);
    try {
      await deleteStory(storyId, mediaUrl);
      onDelete?.();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-20">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        disabled={loading}
        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 disabled:opacity-50"
        title="Supprimer cette story"
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}