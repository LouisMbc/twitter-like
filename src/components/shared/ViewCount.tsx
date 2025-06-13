"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

interface ViewCounterProps {
  contentId: string;
  contentType: 'tweet' | 'comment';
  initialCount?: number; // Ajouter cette propriété
}

// Fonction pour générer un UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ViewCount({ contentId, contentType, initialCount }: ViewCounterProps) {
  const [count, setCount] = useState(initialCount || 0);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const { count } = await supabase
          .from('ViewCounts')
          .select('*', { count: 'exact', head: true })
          .eq('content_id', contentId)
          .eq('content_type', contentType);

        setCount(count || initialCount);
      } catch (err) {
        console.error('Error fetching view count:', err);
        setCount(initialCount);
      }
    };

    fetchViewCount();
  }, [contentId, contentType, initialCount]);

  const incrementViewCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profileData } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profileData) return;

      // Check if user already viewed this content
      const { data: existingView } = await supabase
        .from('ViewCounts')
        .select('id')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('viewer_id', profileData.id)
        .single();

      if (existingView) return; // Already viewed

      // Add new view
      await supabase
        .from('ViewCounts')
        .insert([{
          content_id: contentId,
          content_type: contentType,
          viewer_id: profileData.id
        }]);

      // Update count
      setCount(prevCount => prevCount + 1);
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  return (
    <div className="flex items-center text-gray-500">
      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path
          fillRule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{count}</span>
    </div>
  );
}