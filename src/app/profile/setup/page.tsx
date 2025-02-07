// src/app/profile/setup/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface ProfileForm {
  firstName: string;
  lastName: string;
  nickname: string;
  bio: string;
  profilePicture: File | null;
}

export default function ProfileSetup() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    nickname: '',
    bio: '',
    profilePicture: null,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    // Vérifier que l'utilisateur est connecté
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  // Fonction pour gérer l'upload de l'image
  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Upload d'un fichier
    const { data, error } = await supabase.storage
      .from('profiles')           // nom du bucket
      .upload(filePath, file); // nom fichier + fichier

    if (error) throw error;

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let profilePictureUrl = '';
      if (formData.profilePicture) {
        profilePictureUrl = await handleImageUpload(formData.profilePicture);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Non authentifié');

      const { error: profileError } = await supabase
        .from('Profile')
        .insert([
          {
            user_id: session.user.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            nickname: formData.nickname,
            bio: formData.bio,
            profilePicture: profilePictureUrl,
          },
        ]);

      if (profileError) throw profileError;

      // Redirection vers la page principale après création du profil
      if (!profileError) {
        router.push('/dashboard'); // Redirection vers la nouvelle page d'accueil
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configurer votre profil</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Nickname */}
        <div>
          <label className="block text-sm font-medium mb-1">Pseudo</label>
          <input
            type="text"
            required
            value={formData.nickname}
            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
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
          <label className="block text-sm font-medium mb-1">Photo de profil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFormData(prev => ({ ...prev, profilePicture: file }));
                // Créer une prévisualisation
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="w-full p-2 border rounded"
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Prévisualisation" 
                className="w-32 h-32 object-cover rounded-full"
              />
            </div>
          )}
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Création en cours...' : 'Créer mon profil'}
        </button>
      </form>
    </div>
  );
}