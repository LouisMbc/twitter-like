"use client";

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { notificationService } from '@/services/supabase/notification';

interface ReactionBarProps {
  tweetId?: string;
  commentId?: string;   
}

interface ReactionCount {
  reaction_type: string;
  count: number;
}

export default function ReactionBar({ tweetId, commentId }: ReactionBarProps) {
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Mettre à jour les types de réactions pour correspondre à la table SQL
  const reactionTypes = {
    '👍': 'like',
    '❤️': 'love',
    '👏': 'celebrate',  // Changé de 😂 à 👏
    '💡': 'insightful', // Changé de 😢 à 💡
    '😆': 'funny'       // Changé de 😠 à 😆
  };

  useEffect(() => {
    if (tweetId || commentId) {
      loadReactions();
      checkUserReaction();
    }
  }, [tweetId, commentId]);

  const loadReactions = async () => {
    try {
      // D'abord récupérer l'ID du profil de l'utilisateur connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('reactions')
        .select(`
          reaction_type,
          user_id (
            id,
            user_id
          )
        `)
        .match(tweetId ? { tweet_id: tweetId } : { comment_id: commentId });

      if (error) {
        console.error('Erreur Supabase:', error.message);
        return;
      }

      // Créer un objet pour compter les réactions
      const reactionCounts: { [key: string]: number } = {};
      
      // Initialiser les compteurs pour tous les types de réactions
      Object.values(reactionTypes).forEach(type => {
        reactionCounts[type] = 0;
      });

      // Compter les réactions
      data?.forEach(reaction => {
        if (reaction.reaction_type in reactionCounts) {
          reactionCounts[reaction.reaction_type]++;
        }
      });

      // Convertir en tableau pour l'état
      const counts: ReactionCount[] = Object.entries(reactionCounts).map(([type, count]) => ({
        reaction_type: type,
        count: count
      }));

      setReactions(counts);
    } catch (error: any) {
      console.error('Erreur lors du chargement des réactions:', error.message || error);
    }
  };

  const checkUserReaction = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // D'abord récupérer l'ID du profil de l'utilisateur
    const { data: profileData, error: profileError } = await supabase
      .from('Profile')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profileData) return;

    const { data, error } = await supabase
      .from('reactions') 
      .select('reaction_type')
      .match({
        user_id: profileData.id,
        ...(tweetId ? { tweet_id: tweetId } : { comment_id: commentId })
      })
      .single();

    if (!error && data) {
      setUserReaction(data.reaction_type);
    }
  };

  const handleReaction = async (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Récupérer l'ID du profil de l'utilisateur connecté
      const { data: profileData } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profileData) throw new Error('Profil non trouvé');

      // Vérifier si une réaction existe déjà
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select('*')
        .match({
          user_id: profileData.id,
          ...(tweetId ? { tweet_id: tweetId } : { comment_id: commentId })
        })
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          // Supprimer la réaction
          await supabase
            .from('reactions')
            .delete()
            .match({
              user_id: profileData.id,
              ...(tweetId ? { tweet_id: tweetId } : { comment_id: commentId })
            });
        } else {
          // Mettre à jour le type de réaction
          await supabase
            .from('reactions')
            .update({ reaction_type: type })
            .match({
              user_id: profileData.id,
              ...(tweetId ? { tweet_id: tweetId } : { comment_id: commentId })
            });
        }
      } else {
        // Créer une nouvelle réaction
        await supabase
          .from('reactions')
          .insert([{
            user_id: profileData.id,
            ...(tweetId ? { tweet_id: tweetId } : { comment_id: commentId }),
            reaction_type: type
          }]);

        // Créer une notification pour le like uniquement (réaction la plus courante)
        if (type === 'like' && tweetId) {
          // Récupérer l'auteur du tweet pour la notification
          const { data: tweetData } = await supabase
            .from('Tweets')
            .select('author_id')
            .eq('id', tweetId)
            .single();

          if (tweetData && tweetData.author_id !== profileData.id) {
            await notificationService.createLikeNotification(
              tweetId,
              tweetData.author_id,
              profileData.id
            );
          }
        }
      }

      await loadReactions();
      await checkUserReaction();
    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      {Object.entries(reactionTypes).map(([emoji, type]) => (
        <button
          key={type}
          onClick={(e) => handleReaction(e, type)}
          className={`flex items-center space-x-1 hover:text-gray-700 ${
            userReaction === type ? 'text-blue-500' : ''
          }`}
        >
          <span>{emoji}</span>
          <span>
            {reactions.find(r => r.reaction_type === type)?.count || 0}
          </span>
        </button>
      ))}
    </div>
  );
}