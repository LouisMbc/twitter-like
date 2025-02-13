// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Vérifier si un profil existe déjà
          const { data: profile } = await supabase
            .from('Profile')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!profile) {
            // Rediriger vers la page de configuration initiale
            router.push('/profile/setup');
          } else {
            router.push('/profile');
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/auth/login?error=Échec de la vérification');
      }
    };

    handleAuthCallback();
  }, [router]);

  return <div>Vérification en cours...</div>;
}