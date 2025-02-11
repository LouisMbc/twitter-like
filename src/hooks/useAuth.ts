// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import supabase from '@/lib/supabase';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      if (!profile && pathname !== '/profile/setup') {
        router.push('/profile/setup');
      }
    };

    checkAuth();
  }, [router, pathname]);
}// Hook pour l'authentification
