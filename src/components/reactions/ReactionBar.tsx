"use client";

import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';

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

  const reactionTypes = {
    '👍': 'like',
    '❤️': 'love',
    '👏': 'celebrate',
    '💡': 'insightful',
    '😆': 'funny'
  };

  const loadReactions = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data: profileData } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (!profileData) return;

      let query = supabase
        .from('Reactions')
        .select('reaction_type, count(*)')
        .group('reaction_type');

      if (tweetId) {
        query = query.eq('tweet_id', tweetId);
      } else if (commentId) {
        query = query.eq('comment_id', commentId);
      }

      const { data: reactionData } = await query;
      if (reactionData) {
        setReactions(reactionData as ReactionCount[]);
      }
    } catch (err) {
      console.error('Error loading reactions:', err);
    }
  }, [tweetId, commentId]);

  const checkUserReaction = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data: profileData } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (!profileData) return;

      let query = supabase
        .from('Reactions')
        .select('reaction_type')
        .eq('profile_id', profileData.id);

      if (tweetId) {
        query = query.eq('tweet_id', tweetId);
      } else if (commentId) {
        query = query.eq('comment_id', commentId);
      }

      const { data } = await query.single();
      setUserReaction(data?.reaction_type || null);
    } catch (err) {
      console.error('Error checking user reaction:', err);
    }
  }, [tweetId, commentId]);

  useEffect(() => {
    if (tweetId || commentId) {
      loadReactions();
      checkUserReaction();
    }
  }, [tweetId, commentId, loadReactions, checkUserReaction]);

  const handleReaction = async (e: React.MouseEvent, reactionType: string) => {
    e.stopPropagation();
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data: profileData } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (!profileData) return;

      if (userReaction === reactionType) {
        // Remove reaction
        let deleteQuery = supabase
          .from('Reactions')
          .delete()
          .eq('profile_id', profileData.id)
          .eq('reaction_type', reactionType);

        if (tweetId) {
          deleteQuery = deleteQuery.eq('tweet_id', tweetId);
        } else if (commentId) {
          deleteQuery = deleteQuery.eq('comment_id', commentId);
        }

        await deleteQuery;
        setUserReaction(null);
      } else {
        // Add or update reaction
        const reactionData = {
          profile_id: profileData.id,
          reaction_type: reactionType,
          tweet_id: tweetId || null,
          comment_id: commentId || null
        };

        if (userReaction) {
          // Update existing reaction
          let updateQuery = supabase
            .from('Reactions')
            .update({ reaction_type: reactionType })
            .eq('profile_id', profileData.id);

          if (tweetId) {
            updateQuery = updateQuery.eq('tweet_id', tweetId);
          } else if (commentId) {
            updateQuery = updateQuery.eq('comment_id', commentId);
          }

          await updateQuery;
        } else {
          // Insert new reaction
          await supabase
            .from('Reactions')
            .insert([reactionData]);
        }

        setUserReaction(reactionType);
      }

      // Reload reactions
      loadReactions();
    } catch (err) {
      console.error('Error handling reaction:', err);
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