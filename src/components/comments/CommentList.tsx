"use client";

import { useEffect, useState, useCallback } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CommentForm from '@/components/comments/CommentForm';
import supabase from '@/lib/supabase';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string;
  };
  tweet_id: string;
  view_count?: number;
}

interface CommentListProps {
  tweetId?: string;
  comments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
}

const CommentList: React.FC<CommentListProps> = ({ tweetId, comments: initialComments, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [loading, setLoading] = useState(!initialComments && !!tweetId);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!tweetId) return;
    
    try {
      const { data, error } = await supabase
        .from('Comments')
        .select(`
          *,
          author:Profile!inner(id, nickname, profilePicture)
        `)
        .eq('tweet_id', tweetId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [tweetId]);

  useEffect(() => {
    if (tweetId && !initialComments) {
      fetchComments();
    }
  }, [tweetId, initialComments, fetchComments]);

  const handleCommentAdded = useCallback((comment: Comment) => {
    setComments(prev => [...prev, comment]);
    if (onCommentAdded) {
      onCommentAdded(comment);
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

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <div className="flex-shrink-0">
            {comment.author?.profilePicture ? (
              <Image
                src={comment.author.profilePicture}
                alt={comment.author.nickname || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">
                  {comment.author?.nickname?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {comment.author?.nickname || 'Anonymous'}
            </p>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
        </div>
      ))}
      
      {tweetId && (
        <CommentForm
          tweetId={tweetId}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
};

export default CommentList;