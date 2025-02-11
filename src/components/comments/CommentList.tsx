"use client";

import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import CommentForm from './CommentForm';
import ReactionBar from '@/components/reactions/ReactionBar';
import supabase from '@/lib/supabase';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  view_count: number;
  parent_comment_id?: string;
  author: {
    id: string;
    nickname: string;
    profilePicture: string | null;
  };
  replies?: Comment[];
}

interface CommentListProps {
  tweetId: string;
  initialComments?: Comment[];
}

export default function CommentList({ tweetId, initialComments = [] }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const loadComments = async () => {
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

    // Organiser les commentaires en arbre
    const commentTree = (data || []).reduce((acc: Comment[], comment) => {
      if (!comment.parent_comment_id) {
        // Commentaires parents
        acc.push({ ...comment, replies: [] });
      } else {
        // Trouver le parent et ajouter la réponse
        const parent = acc.find(c => c.id === comment.parent_comment_id);
        if (parent && parent.replies) {
          parent.replies.push(comment);
        }
      }
      return acc;
    }, []);

    setComments(commentTree);
  };

  const formatDate = (date: string) => {
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      locale: fr
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex space-x-3 text-sm ${isReply ? 'ml-8' : ''}`}>
      <div className="w-8 h-8 rounded-full overflow-hidden">
        {comment.author.profilePicture ? (
          <img
            src={comment.author.profilePicture}
            alt={comment.author.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">
              {comment.author.nickname.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="font-medium">{comment.author.nickname}</p>
          <p className="text-gray-600">{comment.content}</p>
              <div className="mt-2">
            <ReactionBar commentId={comment.id} />
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-1">
          <p className="text-xs text-gray-500">
            {formatDate(comment.created_at)}
          </p>
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            Répondre
          </button>
        </div>
        {replyingTo === comment.id && (
          <div className="mt-2">
            <CommentForm
              tweetId={tweetId}
              parentCommentId={comment.id}
              onCommentAdded={() => {
                loadComments();
                setReplyingTo(null);
              }}
              onCancel={() => setReplyingTo(null)}
            />
          </div>
        )}
        {comment.replies?.map(reply => renderComment(reply, true))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {comments.map(comment => renderComment(comment))}
      {!replyingTo && <CommentForm tweetId={tweetId} onCommentAdded={loadComments} />}
    </div>
  );
}