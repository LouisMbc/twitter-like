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
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>

      {!submitted ? (
        <>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border rounded-lg"
                placeholder="Entrez votre email"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien magique'}
            </button>
          </form>

          {/* Ajout du lien vers la page de connexion */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link 
                href="/auth/login" 
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="text-green-500">
            ✓ Un lien de connexion a été envoyé à {email}
          </div>
          <p className="text-gray-600">
            Veuillez vérifier votre boîte mail et cliquer sur le lien pour vous connecter.
          </p>
        </div>
      )}
    </div>
  );
}