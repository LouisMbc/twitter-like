import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { profileService } from '@/services/supabase/profile';
import { ProfileForm } from '@/types';
import supabase from '@/lib/supabase';

export const useProfileSetup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ProfileForm>({
    lastName: '',
    firstName: '',
    nickname: '',
    bio: '',
    profilePicture: null,
    password: '',
    confirmPassword: '',
    location: '',
    currentCoverPicture: null,
    website: ''
  });

  const validateForm = () => {
    // Nettoyer le nickname en enlevant les @ en début
    const cleanNickname = formData.nickname.replace(/^@+/, '');
    
    if (!cleanNickname.trim()) {
      throw new Error("Le nom d'utilisateur est requis");
    }
    if (cleanNickname.length < 2) {
      throw new Error("Le nom d'utilisateur doit contenir au moins 2 caractères");
    }
    
    // Mettre à jour le formData avec le nickname nettoyé
    setFormData(prev => ({ ...prev, nickname: cleanNickname }));

    if (!formData.password) {
      throw new Error('Le mot de passe est requis');
    }
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    if (formData.password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      validateForm();
      
      // Corriger la récupération de la session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      // Mettre à jour le mot de passe
      if (formData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password
        });
        if (passwordError) throw passwordError;
      }

      // Upload de la photo de profil
      let profilePictureUrl = null;
      if (formData.profilePicture) {
        profilePictureUrl = await profileService.uploadProfilePicture(formData.profilePicture);
      }

      // Créer le profil
      const { error: profileError } = await profileService.createProfile(session.user.id, {
        lastName: formData.lastName,
        firstName: formData.firstName,
        nickname: formData.nickname,
        bio: formData.bio,
        profilePicture: profilePictureUrl
      });

      if (profileError) throw profileError;

      router.push('/profile');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit
  };
};