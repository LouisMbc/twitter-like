"use client";

import { useEffect, useState } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  tweetId?: string;  // Make tweetId optional
  comments?: Comment[]; // Add the ability to pass comments directly
  parentCommentId?: string;
}

const CommentList: React.FC<CommentListProps> = ({ tweetId, comments: initialComments, parentCommentId }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [loading, setLoading] = useState(!initialComments);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Function to load or refresh comments
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

  useEffect(() => {
    // If comments are already provided, don't load them
    if (initialComments) return;
    
    // Otherwise, load comments for the specified tweet
    loadComments();
  }, [tweetId, initialComments]);

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
    
    return levelComments.map((comment) => {
      // Support both new and legacy comment structure
      const author = comment.author || comment.profiles;
      const profilePicture = author?.profilePicture || comment.profile_picture || '/default-profile.png';
      const nickname = author?.nickname || 'Anonymous';
      const authorId = author?.id || '';
      
      return (
        <div 
          key={comment.id} 
          className={`p-4 border-b border-gray-800 hover:bg-gray-900/30 ${level > 0 ? 'ml-8 mt-2' : ''}`}
        >
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <Link href={`/profile/${authorId}`}>
                <img
                  src={profilePicture}
                  alt={nickname}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </Link>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Link href={`/profile/${authorId}`} className="font-semibold hover:underline mr-2">
                  {nickname}
                </Link>
                <span className="text-gray-500 text-sm">
                  {formatDistance(new Date(comment.created_at), new Date(), {
                    addSuffix: true,
                    locale: fr
                  })}
                </span>
              </div>
              
              <p className="text-gray-200 mb-2">{comment.content}</p>
              
              <div className="flex items-center text-gray-500">
                <ReactionBar commentId={comment.id} />
                <ViewCount contentId={comment.id} contentType="comment" initialCount={comment.view_count || 0} />
                
                <button 
                  className="flex items-center hover:text-blue-400"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>Répondre</span>
                </button>
              </div>
              
              {replyingTo === comment.id && (
                <div className="mt-3">
                  <CommentForm
                    tweetId={tweetId || ''}
                    parentCommentId={comment.id}
                    onCommentAdded={() => {
                      setReplyingTo(null);
                      loadComments();
                    }}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}
              
              {/* Render child comments recursively */}
              {renderComments(comment.id, level + 1)}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold p-4 border-b border-gray-800">
        Commentaires ({comments.length})
      </h3>
      {renderComments()}
    </div>
  );
};

export default CommentList;