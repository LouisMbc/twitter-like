"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { viewService } from '@/services/supabase/viewCount';

interface ViewCountProps {
  contentId: string;
  contentType: 'tweet' | 'comment';
  initialCount?: number;
}

export default function ViewCount({ contentId, contentType, initialCount = 0 }: ViewCountProps) {
  const [viewCount, setViewCount] = useState(initialCount);
  const { session } = useAuth();

  useEffect(() => {
    const trackView = async () => {
      try {
        const { error } = await viewService.incrementView(
          contentId,
          contentType,
          session?.user?.id,
          window.sessionStorage.getItem('visitorId') || crypto.randomUUID()
        );

        if (!error) {
          const { count } = await viewService.getViewCount(contentId, contentType);
          setViewCount(count);
        }
      } catch (error) {
        console.error('Erreur lors du suivi de la vue:', error);
      }
    };

    trackView();
  }, [contentId, contentType, session]);

  return (
    <div className="text-sm text-gray-500">
      {viewCount} vue{viewCount !== 1 ? 's' : ''}
    </div>
  );
}