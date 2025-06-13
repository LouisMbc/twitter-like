"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import LogoLoader from '@/components/loader/loader';

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
          .eq('nickname', username)
          .single();

        if (profile) {
          // Rediriger vers la page de profil normale
          router.replace(`/profile/${profile.id}`);
        } else {
          // Utilisateur non trouvé
          router.push('/404');
        }
      } catch {
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      redirectToProfile();
    }
  }, [username, router]);

  if (loading) {
    return <LogoLoader />;
  }

  return null;
}
