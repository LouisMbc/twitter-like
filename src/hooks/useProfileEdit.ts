import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileService } from '@/services/supabase/profile';
import { authService } from '@/services/supabase/auth';
import { ProfileForm } from '@/types';

export const useProfileEdit = () => {
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

  const loadProfile = async () => {
    try {
      const session = await authService.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profile, error } = await profileService.getProfile(session.user.id);
      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        lastName: profile.lastName || '',
        firstName: profile.firstName || '',
        nickname: profile.nickname || '',
        bio: profile.bio || '',
        currentProfilePicture: profile.profilePicture || ''
      }));
    } catch (error) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ProfileForm) => {
    setLoading(true);
    setError('');

    try {
      const session = await authService.getSession();
      if (!session) throw new Error('Non authentifié');

      if (formData.password) {
        await authService.updatePassword(formData.password, formData.confirmPassword);
      }

      let profilePictureUrl = formData.currentProfilePicture;
      if (formData.profilePicture) {
        profilePictureUrl = await profileService.uploadProfilePicture(formData.profilePicture);
      }

      await profileService.updateProfile(session.user.id, {
        lastName: formData.lastName,
        firstName: formData.firstName,
        nickname: formData.nickname,
        bio: formData.bio,
        profilePicture: profilePictureUrl,
      });

      router.push('/profile');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit,
    loadProfile
  };
};