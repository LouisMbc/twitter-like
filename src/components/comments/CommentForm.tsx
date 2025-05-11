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
  
        // Vérifier d'abord si le profil existe
        let { data: profileData, error: profileError } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
  
        // Si le profil n'existe pas ou il y a une erreur, essayer avec le nom de table au pluriel
        if (profileError || !profileData) {
          console.log('Tentative avec la table "Profiles"');
          ({ data: profileData, error: profileError } = await supabase
            .from('Profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single());
            
          // Si toujours pas de profil, en créer un
          if (profileError || !profileData) {
            console.log('Création d\'un nouveau profil pour l\'utilisateur');
            const { data: newProfile, error: createError } = await supabase
              .from('Profile') // Essayer d'abord avec 'Profile'
              .insert([{
                user_id: session.user.id,
                username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
                display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Nouvel utilisateur',
                avatar_url: session.user.user_metadata?.avatar_url || null
              }])
              .select('id')
              .single();
              
            if (createError) {
              // Si échec avec 'Profile', essayer avec 'Profiles'
              const { data: newProfilePlural, error: createErrorPlural } = await supabase
                .from('Profiles')
                .insert([{
                  user_id: session.user.id,
                  username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
                  display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Nouvel utilisateur',
                  avatar_url: session.user.user_metadata?.avatar_url || null
                }])
                .select('id')
                .single();
                
              if (createErrorPlural) {
                console.error('Impossible de créer un profil:', createErrorPlural);
                throw new Error('Impossible de créer un profil utilisateur');
              }
              
              profileData = newProfilePlural;
            } else {
              profileData = newProfile;
            }
          }
        }
        
        if (!profileData || !profileData.id) {
          console.error('Profil incomplet:', profileData);
          throw new Error('Profil incomplet ou invalide');
        }
        
        console.log('ID de profil trouvé ou créé:', profileData.id);

        // Créer le commentaire avec l'ID du profil
        const { error } = await supabase
          .from('Comments')
          .insert([{
            content,
            tweet_id: tweetId,
            author_id: profileData.id,
            parent_comment_id: parentCommentId || null
          }]);
  
        if (error) {
          const errorDetails = {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          };
          console.error('Erreur d\'insertion dans Comments:', JSON.stringify(errorDetails));
          throw new Error(`Erreur d'insertion: ${error.message || 'Erreur inconnue'}`);
        }
  
        setContent('');
        onCommentAdded();
        if (onCancel) onCancel();
      } catch (error: any) {
        // Gestion d'erreur améliorée
        const errorMessage = error.message || error.error_description || 'Une erreur inconnue est survenue';
        
        // Message d'erreur plus convivial pour la violation de contrainte de clé étrangère
        if (errorMessage.includes('foreign key constraint') && errorMessage.includes('fk_comments_profiles')) {
          console.error('Erreur: Le profil utilisateur n\'existe pas ou n\'est pas correctement lié.');
        } else {
          console.error('Erreur lors de l\'envoi du commentaire:', errorMessage);
        }
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