// src/components/tweets/RetweetButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { tweetService } from '@/services/supabase/tweet';
import supabase from '@/lib/supabase';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface RetweetButtonProps {
  tweetId: string;
  onRetweet?: () => void;
}

export default function RetweetButton({ tweetId, onRetweet }: RetweetButtonProps) {
  const [hasRetweeted, setHasRetweeted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Récupérer l'ID du profil de l'utilisateur actuel
    const getUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (data) {
          setCurrentProfileId(data.id);
          
          // Vérifier si l'utilisateur a déjà retweeté ce tweet
          const { hasRetweeted } = await tweetService.hasRetweeted(data.id, tweetId);
          setHasRetweeted(hasRetweeted);
        }
      }
    };
    
    getUserProfile();
  }, [tweetId]);
  
  const handleRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Pour éviter la navigation vers la page du tweet
    
    if (!currentProfileId) return;
    
    // Rediriger vers la page de création de retweet
    router.push(`/tweets/retweet/${tweetId}`);
  };
  
  return (
    <button 
      onClick={handleRetweet}
      disabled={isLoading || !currentProfileId}
      className="flex items-center text-sm text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
    >
      <ArrowPathIcon className="h-5 w-5 mr-1" />
      <span>Retweeter</span>
    </button>
  );
}