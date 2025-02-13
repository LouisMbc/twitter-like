"use client";

import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import CommentForm from './CommentForm';
import ReactionBar from '@/components/reactions/ReactionBar';
import supabase from '@/lib/supabase';
import { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <div className="text-center text-gray-500">Aucun commentaire</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
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
        </div>
      ))}
    </div>
  );
};

export default CommentList;