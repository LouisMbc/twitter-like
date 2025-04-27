"use client";

import { useEffect, useState } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslatedContent } from '@/types/language';
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

interface CommentItemProps {
  comment: Comment;
  level: number;
  onReply: (commentId: string) => void;
  isReplying: boolean;
  tweetId?: string;
  onCommentAdded: () => void;
  onCancelReply: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  level, 
  onReply, 
  isReplying, 
  tweetId, 
  onCommentAdded, 
  onCancelReply 
}) => {
  const { translateContent } = useTranslation();
  const [translation, setTranslation] = useState<TranslatedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  useEffect(() => {
    async function translateComment() {
      setIsLoading(true);
      const result = await translateContent(comment.content);
      setTranslation(result);
      setIsLoading(false);
    }
    
    translateComment();
  }, [comment.content, translateContent]);

  return (
    <div 
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
      
      {isLoading ? (
        <p className="text-gray-400">Translating...</p>
      ) : (
        <>
          <p className="text-gray-700">{showOriginal ? translation?.originalContent : translation?.translatedContent}</p>
          
          <div className="mt-1 text-xs text-gray-500 flex items-center">
            {!showOriginal && translation?.translatedLanguage && (
              <span>Translated to: {translation.translatedLanguage}</span>
            )}
            <button 
              onClick={() => setShowOriginal(!showOriginal)} 
              className="ml-2 text-blue-500 hover:underline text-xs"
            >
              {showOriginal ? 'Show translation' : 'Show original'}
            </button>
          </div>
        </>
      )}
      
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
        onClick={() => onReply(comment.id)}
      >
        Répondre
      </button>
      {isReplying && tweetId && (
        <CommentForm
          tweetId={tweetId}
          parentCommentId={comment.id}
          onCommentAdded={onCommentAdded}
          onCancel={onCancelReply}
        />
      )}
    </div>
  );
};

const CommentList: React.FC<CommentListProps> = ({ tweetId, comments: initialComments, parentCommentId }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [loading, setLoading] = useState(!initialComments);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const loadComments = async () => {
    if (!tweetId) {
      setError('ID du tweet manquant');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading comments for tweetId:', tweetId);
      const { data, error } = await supabase
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

      if (error) throw error;
      console.log('Comments loaded:', data);
      // Transform data to ensure author is a single object with the correct shape
      const transformedData = (data || []).map(comment => {
        let authorObject: { id: string, nickname: string, profilePicture: string | null };
        
        if (Array.isArray(comment.author)) {
          // If author is an array, take the first element or use default values
          authorObject = comment.author.length > 0 
            ? {
                id: String(comment.author[0].id || ''),
                nickname: String(comment.author[0].nickname || ''),
                profilePicture: comment.author[0].profilePicture || null
              }
            : { id: '', nickname: '', profilePicture: null };
        } else if (comment.author) {
          // If author is an object, use its properties with appropriate defaults
          const author = comment.author as { id?: string | number, nickname?: string, profilePicture?: string | null };
          authorObject = {
            id: String(author.id || ''),
            nickname: String(author.nickname || ''),
            profilePicture: author.profilePicture || null
          };
        } else {
          // Default values if author is null/undefined
          authorObject = { id: '', nickname: '', profilePicture: null };
        }
        
        return {
          ...comment,
          author: authorObject
        };
      }) as Comment[];
      
      setComments(transformedData);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si les commentaires sont déjà fournis, ne pas charger
    if (initialComments) return;
    
    // Sinon, charger les commentaires pour le tweet spécifié
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
      <div key={comment.id}>
        <CommentItem 
          comment={comment} 
          level={level}
          onReply={setReplyingTo}
          isReplying={replyingTo === comment.id}
          tweetId={tweetId}
          onCommentAdded={() => {
            setReplyingTo(null);
            loadComments();
          }}
          onCancelReply={() => setReplyingTo(null)}
        />
        {renderComments(comment.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg mb-3">Commentaires</h3>
      {renderComments()}
    </div>
  );
};

export default CommentList;