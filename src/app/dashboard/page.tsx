// src/app/dashboard/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetList from '@/components/tweets/TweetList';
import useFeed from '@/hooks/useFeed';

export default function DashboardPage() {
  const router = useRouter();
  const { tweets, loading, error, refreshFeed } = useFeed();

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

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Section pour créer un nouveau tweet */}
      <div className="bg-white rounded-lg shadow">
        <TweetComposer onSuccess={refreshFeed} />
      </div>

      {/* Fil d'actualité */}
      <div className="space-y-4">
        {tweets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun tweet dans votre fil d'actualité. 
            Commencez à suivre des personnes pour voir leurs tweets ici !
          </div>
        ) : (
          <TweetList tweets={tweets} />
        )}
      </div>
    </div>
  );
}