// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonction pour récupérer la session actuelle
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Abonnement aux changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Nettoyage de l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export default useAuth;
