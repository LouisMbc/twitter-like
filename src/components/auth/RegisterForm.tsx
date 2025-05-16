"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {!submitted ? (
        <>
          <h2 className="text-2xl font-bold mb-6">Créer un compte</h2>
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-700 bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Entrez votre email"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-full hover:bg-red-600 disabled:opacity-50 font-bold"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien magique'}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-400">
            Déjà un compte?
            <Link href="/auth/login" className="text-red-500 hover:underline ml-1">
              Se connecter
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4 bg-gray-900 rounded-lg p-6">
          <div className="text-green-500 text-xl font-semibold">
            ✓ Un lien de connexion a été envoyé à {email}
          </div>
          <p className="text-gray-400">
            Veuillez vérifier votre boîte mail et cliquer sur le lien pour vous connecter.
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