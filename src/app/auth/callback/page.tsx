"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          router.push('/auth?error=auth_failed');
          return;
        }

        if (data.session?.user) {
          // Vérifier si le profil existe
          const { data: profileData } = await supabase
            .from('Profile')
            .select('id')
            .eq('user_id', data.session.user.id)
            .single();

          if (!profileData) {
            // Le profil n'existe pas, rediriger vers la configuration
            router.push('/profile/setup');
          } else {
            // L'utilisateur est connecté et a un profil, rediriger vers le dashboard
            router.push('/dashboard');
          }
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/auth?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#282325] text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p>Connexion en cours...</p>
      </div>
    </div>
  );
}