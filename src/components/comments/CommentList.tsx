"use client";

import React from 'react';
// Replace with your actual translation hook - options include:
// import { useTranslation } from 'react-i18next';
// or create a local implementation for now:
const useTranslation = () => {
  return {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'noComments': 'No comments yet',
        'comments': 'Comments',
        'reply': 'Reply'
      };
      return translations[key] || key;
    }
  };
};
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

// You can import this type instead of using the inline interface
// import { Comment } from '../../types/comment';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    id: string;
    nickname: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
  tweet_id?: string;
  profile_picture?: string; // Added this from your new code
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  const { t } = useTranslation();
  
  if (!comments || comments.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        {t('noComments')}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold p-4 border-b border-gray-800">
        {t('comments')} ({comments.length})
      </h3>
      
      {comments.map((comment) => (
        <div key={comment.id} className="p-4 border-b border-gray-800 hover:bg-gray-900/30">
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <Link href={`/profile/${comment.profiles.id}`}>
                {/* Using fallback for profile picture */}
                <img
                  src={comment.profiles.profilePicture || comment.profile_picture || '/default-profile.png'}
                  alt={comment.profiles.nickname}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </Link>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Link href={`/profile/${comment.profiles.id}`} className="font-semibold hover:underline mr-2">
                  {comment.profiles.nickname}
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
                <button className="flex items-center hover:text-red-500 mr-4">
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
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
                
                <button className="flex items-center hover:text-blue-400">
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
                  <span>{t('reply')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;