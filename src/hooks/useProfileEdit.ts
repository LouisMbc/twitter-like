import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileService } from '@/services/supabase/profile';
import { authService } from '@/services/supabase/auth';
import { ProfileForm } from '@/types';
import supabase from '@/lib/supabase';

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

  // Modifier la fonction loadProfile pour vérifier également l'état de l'abonnement

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log("Début du chargement du profil");
      
      const session = await authService.getSession();
      if (!session) {
        console.log("Aucune session trouvée, redirection vers la page de connexion");
        router.push('/auth/login');
        return;
      }
      
      // Chargement du profil
      const { data: profile, error } = await profileService.getProfile(session.user.id);
      
      if (error) throw error;
      if (!profile) {
        setError('Profil non trouvé');
        return;
      }
      
      // Vérifier l'état de l'abonnement dans Stripe (si nécessaire)
      try {
        const { data: subscription, error: subscriptionError } = await supabase
          .from('Subscriptions')
          .select('*')
          .eq('profile_id', profile.id)
          .single();
        
        if (subscriptionError) {
          console.error('Erreur lors de la récupération de l\'abonnement:', subscriptionError);
        } else if (subscription && subscription.status === 'active' && !profile.is_premium) {
          // Mettre à jour le statut premium si nécessaire
          await profileService.updatePremiumStatus(session.user.id, true);
          profile.is_premium = true;
        }
      } catch (err) {
        console.error('Exception lors de la vérification de l\'abonnement:', err);
      }
      
      setFormData(prev => ({
        ...prev,
        lastName: profile.lastName || '',
        firstName: profile.firstName || '',
        nickname: profile.nickname || '',
        bio: profile.bio || '',
        currentProfilePicture: profile.profilePicture || '',
        password: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Erreur lors du chargement du profil: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
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