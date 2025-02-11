"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface ProfileForm {
  lastName: string;
  firstName: string;
  nickname: string;
  bio: string;
  profilePicture: File | null;
  currentProfilePicture: string;
  password: string;
  confirmPassword: string;
}

interface SetupForm {
  lastName: string;
  firstName: string;
  nickname: string;
  bio: string;
  profilePicture: File | null;
  password: string;
  confirmPassword: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ProfileForm>({
    lastName: '',
    firstName: '',
    nickname: '',
    bio: '',
    profilePicture: null,
    currentProfilePicture: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('Profile')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setFormData(prev => ({
          ...prev,
          lastName: profile.lastName || '',
          firstName: profile.firstName || '',
          nickname: profile.nickname || '',
          bio: profile.bio || '',
          currentProfilePicture: profile.profilePicture || ''
        }));
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Non authentifié');

      // Vérifier le mot de passe si fourni
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        if (formData.password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }

        // Mettre à jour le mot de passe
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password
        });

        if (passwordError) throw passwordError;
      }

      // Gérer l'upload de la nouvelle photo de profil
      let profilePictureUrl = formData.currentProfilePicture;
      if (formData.profilePicture) {
        profilePictureUrl = await handleImageUpload(formData.profilePicture);
      }

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('Profile')
        .update({
          lastName: formData.lastName,
          firstName: formData.firstName,
          nickname: formData.nickname,
          bio: formData.bio,
          profilePicture: profilePictureUrl,
        })
        .eq('user_id', session.user.id);

      if (updateError) throw updateError;

      router.push('/profile');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Modifier le profil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo de profil */}
        <div>
          <label className="block text-sm font-medium mb-2">Photo de profil</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              {formData.currentProfilePicture ? (
                <img
                  src={formData.currentProfilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">
                    {formData.firstName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData(prev => ({ ...prev, profilePicture: file }));
                }
              }}
              className="flex-1"
            />
          </div>
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium mb-2">Prénom</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Pseudo */}
        <div>
          <label className="block text-sm font-medium mb-2">Pseudo</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full p-2 border rounded-lg resize-none"
          />
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label className="block text-sm font-medium mb-2">Nouveau mot de passe (optionnel)</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            minLength={6}
          />
        </div>

        {/* Confirmation du mot de passe */}
        {formData.password && (
          <div>
            <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              minLength={6}
            />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export function SetupProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SetupForm>({
    lastName: '',
    firstName: '',
    nickname: '',
    bio: '',
    profilePicture: null,
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Non authentifié');

      // Vérifier le mot de passe
      if (!formData.password) {
        throw new Error('Le mot de passe est requis');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      if (formData.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // Mettre à jour le mot de passe
      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (passwordError) throw passwordError;

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('Profile')
        .update({
          lastName: formData.lastName,
          firstName: formData.firstName,
          nickname: formData.nickname,
          bio: formData.bio
        })
        .eq('user_id', session.user.id);

      if (updateError) throw updateError;

      router.push('/profile');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configurer le profil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo de profil */}
        <div>
          <label className="block text-sm font-medium mb-2">Photo de profil</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              {formData.profilePicture ? (
                <img
                  src={URL.createObjectURL(formData.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">
                    {formData.firstName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData(prev => ({ ...prev, profilePicture: file }));
                }
              }}
              className="flex-1"
            />
          </div>
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium mb-2">Prénom</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Pseudo */}
        <div>
          <label className="block text-sm font-medium mb-2">Pseudo</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full p-2 border rounded-lg resize-none"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium mb-2">Mot de passe</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            minLength={6}
          />
        </div>

        {/* Confirmation du mot de passe */}
        <div>
          <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            minLength={6}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}