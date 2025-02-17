// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
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

  return { session };
}
