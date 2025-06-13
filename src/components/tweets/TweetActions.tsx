import { useState } from 'react';
import supabase from '@/lib/supabase';

interface TweetActionsProps {
  tweetId: string;
  onDelete?: () => void;
}

export default function TweetActions({ tweetId, onDelete }: TweetActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer ce tweet ?')) return;
    
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('Tweets')
        .delete()
        .eq('id', tweetId);

      if (deleteError) throw deleteError;
      onDelete?.();
    } catch (err) {
      console.error('Error deleting tweet:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-500 hover:text-red-600 disabled:opacity-50"
      >
        {loading ? 'Suppression...' : 'Supprimer'}
      </button>
    </div>
  );
}