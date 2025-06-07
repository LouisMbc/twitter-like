"use client";

import { useEffect } from 'react';
import supabase from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          router.push('/dashboard');
        } else {
          router.push('/auth');
        }
      } catch (err) {
        router.push('/auth');
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
        <div className="mt-4">Redirection en cours...</div>
      </div>
    </div>
  );
}