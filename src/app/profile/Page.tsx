"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface SignupForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio: string;
  profilePicture: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    bio: '',
    profilePicture: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Créer le compte utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authData.user.id,
              firstName: formData.firstName,
              lastName: formData.lastName,
              bio: formData.bio,
              profilePicture: formData.profilePicture,
              certified: false, // Par défaut non certifié
            },
          ]);

        if (profileError) throw profileError;

        // 3. Rediriger vers la page de connexion
        router.push('/auth/login');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Photo de profil */}
        <div>
          <label className="block text-sm font-medium mb-1">Photo de profil (URL)</label>
          <input
            type="url"
            value={formData.profilePicture}
            onChange={(e) => setFormData(prev => ({ ...prev, profilePicture: e.target.value }))}
            className="w-full p-2 border rounded"
          />"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface SignupForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio: string;
  profilePicture: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    bio: '',
    profilePicture: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Créer le compte utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authData.user.id,
              firstName: formData.firstName,
              lastName: formData.lastName,
              bio: formData.bio,
              profilePicture: formData.profilePicture,
              certified: false, // Par défaut non certifié
            },
          ]);

        if (profileError) throw profileError;

        // 3. Rediriger vers la page de connexion
        router.push('/auth/login');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Photo de profil */}
        <div>
          <label className="block text-sm font-medium mb-1">Photo de profil (URL)</label>
          <input
            type="url"
            value={formData.profilePicture}
            onChange={(e) => setFormData(prev => ({ ...prev, profilePicture: e.target.value }))}
            className="w-full p-2 border rounded"
          />