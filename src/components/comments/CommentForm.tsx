"use client";

import React, { useState } from 'react';
import { mentionService } from '@/services/supabase/mention';
import MentionTextarea from '@/components/mentions/MentionTextarea';
import supabase from '@/lib/supabase';

interface CommentFormProps {
  tweetId: string;
  onCommentAdded: (comment: Comment) => void;
  parentCommentId?: string;
}

export default function CommentForm({ tweetId, onCommentAdded, parentCommentId }: CommentFormProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Non authentifié');
  
        // Vérifier que l'utilisateur a un profil
        const { data: userProfile, error: profileCheckError } = await supabase
          .from('Profile')
          .select('id, nickname, profilePicture')
          .eq('user_id', session.user.id)
          .single();

        if (profileCheckError || !userProfile) {
          throw new Error('Profil utilisateur non trouvé');
        }

        // Gérer les mentions dans les commentaires
        try {
          const mentions = mentionService.extractMentions(content);
          
          // Process mentions but don't use mentionError variable
          if (mentions.length > 0) {
            await mentionService.createMentions(mentions, tweetId, 'comment');
          }
        } catch {
        }
  
        // Créer le commentaire
        const { data: comment } = await supabase
          .from('Comments')
          .insert([{
            content,
            tweet_id: tweetId,
            author_id: userProfile.id, // Utiliser l'ID du profil
            parent_id: parentCommentId
          }])
          .select(`
            *,
            author:Profile!inner(id, nickname, profilePicture)
          `)
          .single();

        if (comment) {
          onCommentAdded(comment);
          setContent('');
        }
      } catch (err) {
        console.error('Error creating comment:', err);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <MentionTextarea
              value={content}
              onChange={setContent}
              placeholder={parentCommentId ? "Répondre au commentaire..." : "Poster votre réponse..."}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi...</span>
              </div>
              ) : (
              'Répondre'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }