"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          router.push('/');
          return;
        }

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
        console.error('Erreur inattendue:', error);
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return <div>Vérification en cours...</div>;
}