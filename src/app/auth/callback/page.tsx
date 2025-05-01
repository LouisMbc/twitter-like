"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import Image from 'next/image';

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="animate-pulse flex justify-center">
        <Image 
          src="/logo_Flow.png" 
          alt="Flow Logo" 
          width={150} 
          height={50} 
          priority
        />
      </div>
      <p className="text-gray-400 mt-4">Connexion en cours...</p>
      <div className="mt-8">
        <div className="w-12 h-1 bg-gray-700 rounded-full mb-2 animate-pulse"></div>
        <div className="w-8 h-1 bg-gray-800 rounded-full mb-2 animate-pulse delay-150"></div>
        <div className="w-10 h-1 bg-gray-700 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  );
}