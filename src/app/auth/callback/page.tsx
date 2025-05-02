"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

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
            router.push('/home'); // Changed to redirect to /home instead of /profile
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/auth/login?error=Échec de la vérification');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <LoadingSpinner message="Connexion en cours..." />
    </div>
  );
}