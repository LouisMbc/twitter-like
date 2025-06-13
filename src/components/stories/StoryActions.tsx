// src/components/stories/StoryActions.tsx
import { useState } from 'react';
import supabase from '@/lib/supabase';

interface StoryActionsProps {
  storyId: string;
  mediaUrl: string;
  onDelete?: () => void;
}

export default function StoryActions({ storyId, mediaUrl, onDelete }: StoryActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette story ?')) return;
    
    setIsDeleting(true);
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('Stories')
        .delete()
        .eq('id', storyId);

      if (dbError) throw dbError;

      // Delete from storage if needed
      if (mediaUrl) {
        const fileName = mediaUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('stories')
            .remove([fileName]);
        }
      }

      onDelete?.();
    } catch (err) {
      console.error('Error deleting story:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 bg-black/50 rounded-full text-white hover:bg-red-600/50 transition-colors"
      >
        {isDeleting ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}