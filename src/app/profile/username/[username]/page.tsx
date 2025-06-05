"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

export default function UsernameProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToProfile = async () => {
      try {
        // Rechercher l'utilisateur par son nickname
        const { data: profile } = await supabase
          .from('Profile')
          .select('id')
          .eq('nickname', `@${username}`)
          .single();

        if (profile) {
          // Rediriger vers la page de profil normale
          router.replace(`/profile/${profile.id}`);
        } else {
          // Utilisateur non trouvé
          router.push('/404');
        }
      } catch (error) {
        console.error('Erreur lors de la recherche du profil:', error);
        router.push('/404');
      }
    };

    if (username) {
      redirectToProfile();
    }
  }, [username, router]);

  if (loading) {
    return <div className="flex justify-center p-8">Recherche du profil...</div>;
  }

  return null;
}
