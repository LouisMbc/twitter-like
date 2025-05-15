"use client";

import { useState } from 'react';
import supabase from '@/lib/supabase';

interface CommentFormProps {
  tweetId: string;
  parentCommentId?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
}

export default function CommentForm({ tweetId, parentCommentId, onCommentAdded, onCancel }: CommentFormProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Non authentifié');
  
        // D'abord récupérer l'ID du profil de l'utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
  
        if (profileError) throw profileError;
        if (!profileData) throw new Error('Profil non trouvé');
  
        // Créer le commentaire avec l'ID du profil
        const { error } = await supabase
          .from('Comments')
          .insert([{
            content,
            tweet_id: tweetId,
            author_id: profileData.id, // Utiliser l'ID du profil au lieu de session.user.id
            parent_comment_id: parentCommentId || null
          }]);
  
        if (error) throw error;
  
        setContent('');
        onCommentAdded();
        if (onCancel) onCancel();
      } catch (error) {
        console.error('Erreur lors de l\'envoi du commentaire:', error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex space-x-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentCommentId ? "Répondre au commentaire..." : "Poster votre réponse..."}
            className="flex-1 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            rows={2}
            required
          />
          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Répondre'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </form>
    );
  }