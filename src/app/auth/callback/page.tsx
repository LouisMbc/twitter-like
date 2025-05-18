"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthCallback from '@/hooks/useAuthCallback';
import supabase from '@/lib/supabase-browser';

export default function AuthCallback() {
  const router = useRouter();
  const { handleCallback } = useAuthCallback();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const redirectPath = await handleCallback(session);
        router.push(redirectPath);
      } else {
        // If no session, redirect to home or login
        router.push('/auth');
      }
    };

    init();
  }, [router, handleCallback]);

  return <div>Vérification en cours...</div>;
}