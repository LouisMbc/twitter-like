// src/components/auth/LoginForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { FaGoogle, FaApple } from 'react-icons/fa';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Login error:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Problème de connexion au serveur. Veuillez vérifier votre connexion internet ou réessayer plus tard.');
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
    <div className="max-w-md mx-auto">
      {!submitted ? (
        <>
          <h2 className="text-2xl font-bold mb-6">Se connecter à Flow</h2>
          
          <div className="space-y-4 mb-6">
            <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
              <FaGoogle className="mr-2" />
              Continuer avec Google
            </button>
            
            <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
              <FaApple className="mr-2" />
              Continuer avec Apple
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-800"></div>
              <span className="px-4 text-gray-500">ou</span>
              <div className="flex-grow h-px bg-gray-800"></div>
            </div>
          </div>

          {!isOnline && (
            <div className="mb-4 p-3 bg-gray-800 text-yellow-400 rounded-md text-sm">
              ⚠️ Vous êtes actuellement hors ligne. La connexion ne sera pas possible.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-700 bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Email"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading || !isOnline}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-full hover:bg-red-600 disabled:opacity-50 font-bold"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-400">
            Pas encore de compte? 
            <Link href="/auth/register" className="text-red-500 hover:underline ml-1">
              S'inscrire
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4 bg-gray-900 rounded-lg p-6">
          <div className="text-green-500 text-xl font-semibold">
            ✓ Vérifiez votre email
          </div>
          <p className="text-gray-400">
            Un lien de connexion a été envoyé à <span className="text-white font-medium">{email}</span>
          </p>
          <p className="text-gray-500">
            Cliquez sur le lien envoyé à votre adresse pour vous connecter.
          </p>
          <button 
            onClick={() => setSubmitted(false)} 
            className="text-red-500 hover:text-red-400 mt-4"
          >
            Utiliser une autre adresse email
          </button>
        </div>
      )}
    </div>
  );
}