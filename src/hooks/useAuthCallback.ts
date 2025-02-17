// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthCallback } from '@/hooks/useAuthCallback';
import supabase from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const { handleCallback } = useAuthCallback();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const redirectPath = await handleCallback(session);
        router.push(redirectPath);
      }
    };

    init();
  }, [router]);

  return <div>Vérification en cours...</div>;
}