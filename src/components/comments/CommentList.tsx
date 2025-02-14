"use client";

import { useEffect, useState } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactionBar from '@/components/reactions/ReactionBar';
import ViewCount from '@/components/shared/ViewCount';
import CommentForm from '@/components/comments/CommentForm';
import supabase from '@/lib/supabase';
import { Comment } from '@/types';

interface CommentListProps {
  tweetId?: string;  // Rendre tweetId optionnel
  comments?: Comment[]; // Ajouter la possibilité de passer directement les commentaires
  parentCommentId?: string;
}

const CommentList: React.FC<CommentListProps> = ({ tweetId, comments: initialComments, parentCommentId }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [loading, setLoading] = useState(!initialComments);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    // Si les commentaires sont déjà fournis, ne pas charger
    if (initialComments) return;
    
    // Sinon, charger les commentaires pour le tweet spécifié
    const loadComments = async () => {
      if (!tweetId) {
        setError('ID du tweet manquant');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading comments for tweetId:', tweetId); // Debug log
        const { data, error } = await supabase
          .from('Comments')
          .select(`
            id,
            content,
            created_at,
            view_count,
            parent_comment_id,
            author:author_id (
              id,
              nickname,
              profilePicture
            )
          `)
          .eq('tweet_id', tweetId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        console.log('Comments loaded:', data); // Debug log
        setComments(data || []);
      } catch (err) {
        console.error('Error loading comments:', err);
        setError('Erreur lors du chargement des commentaires');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [tweetId, initialComments]);

  if (loading) {
    return <div className="text-center text-gray-500">Chargement des commentaires...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (comments.length === 0) {
    return <div className="text-center text-gray-500">Aucun commentaire</div>;
  }

  // Organiser les commentaires en arbre
  const commentTree = comments.reduce((acc: { [key: string]: Comment[] }, comment) => {
    const parentId = comment.parent_comment_id || 'root';
    acc[parentId] = acc[parentId] || [];
    acc[parentId].push(comment);
    return acc;
  }, {});

  const renderComments = (parentId: string = 'root', level: number = 0) => {
    const levelComments = commentTree[parentId] || [];
    
    return levelComments.map((comment) => (
      <div 
        key={comment.id} 
        className={`bg-white p-4 rounded-lg shadow ${level > 0 ? 'ml-8 mt-2' : ''}`}
      >
        <div className="flex items-center space-x-2 mb-2">
          {comment.author.profilePicture ? (
            <img
              src={comment.author.profilePicture}
              alt={comment.author.nickname}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          )}
          <span className="font-semibold">{comment.author.nickname}</span>
        </div>
        <p className="text-gray-700">{comment.content}</p>
        <div className="mt-2 text-sm text-gray-500">
          {formatDistance(new Date(comment.created_at), new Date(), {
            addSuffix: true,
            locale: fr
          })}
        </div>
        <ReactionBar commentId={comment.id} />
        <ViewCount contentId={comment.id} contentType="comment" initialCount={comment.view_count} />
        <button
          className="text-blue-500 text-sm mt-2"
          onClick={() => setReplyingTo(comment.id)}
        >
          Répondre
        </button>
        {replyingTo === comment.id && (
          <CommentForm
            tweetId={tweetId}
            parentCommentId={comment.id}
            onCommentAdded={() => {
              setReplyingTo(null);
              loadComments();
            }}
            onCancel={() => setReplyingTo(null)}
          />
        )}
        {renderComments(comment.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      {renderComments()}
    </div>
  );
};

export default CommentList;