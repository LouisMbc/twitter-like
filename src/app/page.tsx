"use client";

import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const router = useRouter();

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('Tweets')
          .select('*')
          .limit(1);

        if (error) {
          setStatus('Erreur de connexion: ' + error.message);
        } else {
          setStatus('Connexion réussie!');
          console.log('Données reçues:', data);
          
          // Check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // User is logged in, redirect to dashboard
            router.push('/dashboard');
          } else {
            // User is not logged in, redirect to login
            router.push('/auth');
          }
        }
      } catch (err) {
        setStatus('Erreur: ' + (err as Error).message);
      }
    }

    testConnection();
  }, [router]);

  return (
    <div className="min-h-screen p-8">
      <h1>Test de connexion Supabase</h1>
      <p>{status}</p>
    </div>
  );
}