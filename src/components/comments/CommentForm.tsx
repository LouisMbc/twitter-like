"use client";

import React, { useState } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';
import { useProfile } from '@/hooks/useProfile';
import { commentService } from '@/services/supabase/comment';
import { mentionService } from '@/services/supabase/mention';
import MentionTextarea from '@/components/mentions/MentionTextarea';
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
  
        // Vérifier que l'utilisateur a un profil
        const { data: userProfile, error: profileCheckError } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (profileCheckError || !userProfile) {
          throw new Error('Profil utilisateur non trouvé');
        }

        // Créer le commentaire
        const { data: commentData, error } = await supabase
          .from('Comments')
          .insert([{
            content,
            tweet_id: tweetId,
            author_id: session.user.id,
            parent_comment_id: parentCommentId || null
          }])
          .select()
          .single();

        if (error) throw error; 

        // Gérer les mentions dans les commentaires
        try {
          const mentions = mentionService.extractMentions(content);
          console.log('👤 Mentions détectées dans le commentaire:', mentions);
          
          if (mentions.length > 0) {
            console.log('📧 Création des notifications de mention...');
            await mentionService.createCommentMentionNotifications(
              commentData.id,
              tweetId, 
              userProfile.id,
              mentions
            );
            console.log('✅ Notifications de mention créées');
          }
        } catch (mentionError) {
          console.error('❌ Erreur avec les mentions:', mentionError);
        }
  
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
          <MentionTextarea
            value={content}
            onChange={setContent}
            placeholder={parentCommentId ? "Répondre au commentaire..." : "Poster votre réponse..."}
            className="flex-1 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            rows={2}
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