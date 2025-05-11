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
  
        // Rechercher le profil dans la table Profile (la table principale)
        let { data: profileData, error: profileError } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        console.log('Recherche dans Profile:', { profileData, profileError });
        
        // Si le profil n'est pas trouvé dans Profile, créer un nouveau profil
        if (profileError || !profileData) {
          console.log('Profil non trouvé dans la table Profile, création d\'un nouveau profil...');
          
          // Créer un nouveau profil dans la table Profile
          const { data: newProfile, error: createError } = await supabase
            .from('Profile')
            .insert([{
              user_id: session.user.id,
              nickname: session.user.email?.split('@')[0] || `user_${Date.now()}`,
              firstName: session.user.user_metadata?.first_name || '',
              lastName: session.user.user_metadata?.last_name || '',
              profilePicture: session.user.user_metadata?.avatar_url || null,
              bio: '',
              // Ajouter des valeurs par défaut pour les champs obligatoires
              follower_count: 0,
              following_count: 0
            }])
            .select('id')
            .single();
            
          if (createError) {
            console.error('Erreur détaillée lors de la création du profil:', {
              code: createError.code,
              message: createError.message,
              details: createError.details
            });
            throw new Error(`Impossible de créer un profil utilisateur: ${createError.message}`);
          }
          
          profileData = newProfile;
          console.log('Nouveau profil créé:', profileData);
        }
        
        if (!profileData || !profileData.id) {
          console.error('Profil incomplet:', profileData);
          throw new Error('Profil incomplet ou invalide');
        }
        
        console.log('ID de profil utilisé pour le commentaire:', profileData.id);

        // Créer le commentaire avec l'ID du profil
        const { error: commentError } = await supabase
          .from('Comments')
          .insert([{
            content,
            tweet_id: tweetId,
            author_id: profileData.id,
            parent_comment_id: parentCommentId || null
          }]);
  
        if (commentError) {
          const errorDetails = {
            code: commentError.code,
            message: commentError.message,
            details: commentError.details,
            hint: commentError.hint
          };
          console.error('Erreur d\'insertion dans Comments:', JSON.stringify(errorDetails));
          throw new Error(`Erreur d'insertion: ${commentError.message || 'Erreur inconnue'}`);
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
          alert('Une erreur est survenue lors de la publication de votre commentaire. Veuillez rafraîchir la page et réessayer.');
        } else {
          console.error('Erreur lors de l\'envoi du commentaire:', errorMessage);
          alert('Impossible de publier votre commentaire: ' + errorMessage);
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