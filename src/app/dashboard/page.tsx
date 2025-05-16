// src/app/dashboard/page.tsx
"use client";

import { useEffect, useRef, useCallback } from 'react';
import useFeed from '@/hooks/useFeed';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetList from '@/components/tweets/TweetList';
import SimpleSpinner from '@/components/loader/SimpleSpinner';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { tweets, loading, error, refreshFeed, loadMoreTweets, hasMore } = useFeed();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTweets();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMoreTweets]);

  // Vérifier que l'utilisateur est authentifié
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Section pour créer un nouveau tweet */}
      <div className="bg-white rounded-lg shadow">
        <TweetComposer onSuccess={refreshFeed} />
      </div>

      {/* Fil d'actualité */}
      <div className="space-y-4">
        {tweets.length === 0 && !loading ? (
          <div className="text-center text-gray-500 py-8">
            Aucun tweet dans votre fil d'actualité. 
            Commencez à suivre des personnes pour voir leurs tweets ici !
          </div>
        ) : (
          <TweetList tweets={tweets} />
        )}
        
        {/* Indicateur de chargement pour infinite scroll */}
        {loading && tweets.length > 0 && (
          <SimpleSpinner />
        )}
        
        {/* Élément observé pour déclencher le chargement */}
        {hasMore && !loading && tweets.length > 0 && (
          <div ref={loadMoreRef} className="h-10" />
        )}
      </div>
    </div>
  );
}