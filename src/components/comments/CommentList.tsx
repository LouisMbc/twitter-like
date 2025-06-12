"use client";

import { useEffect, useState, useCallback } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CommentForm from '@/components/comments/CommentForm';
import supabase from '@/lib/supabase';

// Import these components or create them if they don't exist
import ReactionBar from '@/components/reactions/ReactionBar';
import ViewCount from '@/components/shared/ViewCount';

// You can create a types file or define interfaces here
interface Comment {
  id: string;
  content: string;
  created_at: string;
  view_count?: number;
  parent_comment_id?: string;
  tweet_id?: string;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string;
  };
  // Legacy structure support
  profiles?: {
    id: string;
    nickname: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
  profile_picture?: string;
}

interface CommentListProps {
  tweetId?: string;
  comments?: Comment[];
  parentCommentId?: string;
  onCommentAdded?: (comment: any) => void;
}

const CommentList: React.FC<CommentListProps> = ({ tweetId, comments: initialComments, parentCommentId, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [loading, setLoading] = useState(!initialComments && !!tweetId);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const router = useRouter();

  const loadComments = useCallback(async () => {
    if (!tweetId) {
      // If initialComments were provided, this function might be called to refresh,
      // but refreshing without a tweetId doesn't make sense unless we re-use initialComments.
      // For now, if tweetId is missing, we assume we can't load/refresh.
      if (!initialComments) {
        setError('ID du tweet manquant pour charger les commentaires.');
      }
      setComments(initialComments || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('Comments')
        .select(`
          id,
          content,
          created_at,
          view_count,
          parent_comment_id,
          tweet_id,
          author:author_id (
            id,
            nickname,
            profilePicture
          )
        `)
        .eq('tweet_id', tweetId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedComments = (data || []).map(commentFromSupabase => {
        // Déterminer l'objet auteur correct
        const authorObject = Array.isArray(commentFromSupabase.author)
          ? commentFromSupabase.author[0] // Prendre le premier élément si c'est un tableau non vide
          : commentFromSupabase.author;   // Sinon, utiliser la valeur telle quelle (objet ou null/undefined)

        return {
          ...commentFromSupabase,
          // Assigner l'objet auteur traité, ou un objet par défaut si l'auteur n'est pas trouvé
          author: authorObject || { id: 'unknown', nickname: 'Utilisateur inconnu', profilePicture: null },
          tweet_id: commentFromSupabase.tweet_id, // S'assurer que c'est bien une chaîne
          // S'assurer que les autres champs correspondent à l'interface Comment si nécessaire
          view_count: commentFromSupabase.view_count || 0,
          parent_comment_id: commentFromSupabase.parent_comment_id === null ? undefined : commentFromSupabase.parent_comment_id,
        };
      });
      setComments(formattedComments as Comment[]);
    } catch (err) {
      setError('Erreur lors du chargement des commentaires');
      setComments(initialComments || []); // Fallback to initial or empty
    } finally {
      setLoading(false);
    }
  }, [tweetId, initialComments]);

  useEffect(() => {
    if (initialComments) {
      setComments(initialComments);
      setLoading(false);
    } else if (tweetId) {
      loadComments();
    } else {
      // No initialComments and no tweetId, list is empty
      setComments([]);
      setLoading(false);
    }
  }, [tweetId, initialComments, loadComments]); // loadComments is a dependency

  const renderContentWithMentions = (content: string) => {
    const parts = content.split(/(@\w+|#\w+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/username/${username}`);
            }}
            className="text-blue-400 hover:text-blue-600 cursor-pointer font-medium"
          >
            {part}
          </span>
        );
      } else if (part.startsWith('#')) {
        const hashtagName = part.slice(1);
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/hashtags/${hashtagName}`);
            }}
            className="text-blue-400 hover:text-blue-600 cursor-pointer font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Fonction pour ajouter un nouveau commentaire à l'état local
  const handleCommentAdded = useCallback((newComment: any) => {
    const formattedComment: Comment = {
      id: newComment.id,
      content: newComment.content,
      created_at: newComment.created_at,
      view_count: newComment.view_count || 0,
      parent_comment_id: newComment.parent_comment_id || undefined,
      tweet_id: newComment.tweet_id,
      author: Array.isArray(newComment.author) ? newComment.author[0] : newComment.author
    };

    // Ajouter le nouveau commentaire à l'état local IMMÉDIATEMENT
    setComments(prevComments => [...prevComments, formattedComment]);
    
    // Appeler le callback parent si fourni
    if (onCommentAdded) {
      onCommentAdded(newComment);
    }
  }, [onCommentAdded]);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Chargement des commentaires...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>;
  }

  if (comments.length === 0) {
    return <div className="py-8 text-center text-gray-500">Aucun commentaire</div>;
  }

  // Organize comments into a tree
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
        className={`bg-gray-900 border border-gray-700 p-4 rounded-lg ${level > 0 ? 'ml-8 mt-2' : ''}`}
      >
        <div className="flex items-center space-x-2 mb-2">
          {comment.author.profilePicture ? (
            <img
              src={comment.author.profilePicture}
              alt={comment.author.nickname}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-700 rounded-full" />
          )}
          <span className="font-semibold text-white">{comment.author.nickname}</span>
        </div>
        <p className="text-gray-100">
          {renderContentWithMentions(comment.content)}
        </p>
        <div className="mt-2 text-sm text-gray-400">
          {formatDistance(new Date(comment.created_at), new Date(), {
            addSuffix: true,
            locale: fr
          })}
        </div>
        <ReactionBar commentId={comment.id} />
        <ViewCount contentId={comment.id} contentType="comment" initialCount={comment.view_count} />
        <button
          className="text-blue-400 hover:text-blue-300 text-sm mt-2"
          onClick={() => setReplyingTo(comment.id)}
        >
          Répondre
        </button>
        {replyingTo === comment.id && (
          <CommentForm
            tweetId={comment.tweet_id || tweetId || ''}
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
    <div className="bg-gray-900">
      <h3 className="text-lg font-semibold p-4 border-b border-gray-700 text-white">
        Commentaires ({comments.length})
      </h3>
      
      {/* SUPPRIMER complètement le formulaire principal - il est maintenant géré par TweetCard */}
      
      {renderComments()}
    </div>
  );
};

export default CommentList;