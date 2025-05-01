// src/components/auth/LoginForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for connectivity
    if (!isOnline) {
      setError('Vous semblez être hors ligne. Veuillez vérifier votre connexion internet.');
      setLoading(false);
      return;
    }

    try {
      const { error: supabaseError, data } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      }).catch(err => {
        console.error('Supabase auth error:', err);
        return { error: new Error('Erreur de connexion au service d\'authentification. Veuillez réessayer.'), data: null };
      });

      if (supabaseError) throw supabaseError;

      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);

      // Provide more user-friendly error messages
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Problème de connexion au serveur. Veuillez vérifier votre connexion internet ou réessayer plus tard.');
        } else if (err.message.includes('Invalid login')) {
          setError('Email ou mot de passe incorrect.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Se connecter</h1>

      {!isOnline && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          ⚠️ Vous êtes actuellement hors ligne. La connexion ne sera pas possible.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="mt-8 text-center text-gray-400">
          Pas encore de compte?
          <Link href="/auth/register" className="text-red-500 hover:underline ml-1">
            S'inscrire
          </Link>

        </p>
      </div>
    </div>
  );
}