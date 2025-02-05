"use client";  // Ajout de cette directive pour utiliser les Hooks

import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

export default function Home() {
  // Les Hooks sont valides ici car nous avons déclaré "use client"
  const [status, setStatus] = useState<string>('Testing connection...');

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('tweets')
          .select('*')  // Sélectionne toutes les colonnes
          .limit(1);

        if (error) {
          setStatus('Erreur de connexion: ' + error.message);
        } else {
          setStatus('Connexion réussie!');
          console.log('Données reçues:', data);
        }
      } catch (err) {
        setStatus('Erreur: ' + (err as Error).message);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1>Test de connexion Supabase</h1>
      <p>{status}</p>
    </div>
  );
}