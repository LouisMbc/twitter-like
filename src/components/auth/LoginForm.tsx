// src/components/auth/LoginForm.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react'; // Import an arrow icon if you have lucide-react

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()} 
            className="text-white mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Se connecter</h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-full p-4 w-16 h-16 flex items-center justify-center">
            <span className="text-red-500 text-3xl font-bold">F</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">Se connecter</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 bg-black border border-gray-600 rounded-md text-white"
            />
          </div>

          <div>
            <input
              type="password"
              required
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-3 bg-black border border-gray-600 rounded-md text-white"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-full hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Pas encore de compte ?{' '}
            <Link 
              href="/auth/register" 
              className="text-red-500 hover:text-red-400"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}