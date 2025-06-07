import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileService } from '@/services/supabase/profile';
import { authService } from '@/services/supabase/auth';
import { ProfileForm } from '@/types';
import supabase from '@/lib/supabase';

export const useProfileEdit = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  const [formData, setFormData] = useState<ProfileForm>({
    lastName: '',
    firstName: '',
    nickname: '',
    bio: '',
    website: '',
    location: '',
    profilePicture: null,
    currentProfilePicture: '',
    password: '',
    confirmPassword: ''
  });

  // Modifier la fonction loadProfile pour vérifier également l'état de l'abonnement

  async function loadProfile() {
    try {
      setLoading(true);

      const sessionResult = await authService.getSession();
      if (!sessionResult.session) {
        router.push('/auth/login');
        return;
      }

      // Chargement du profil
      const { data: profile, error } = await profileService.getProfile(sessionResult.session.user.id);

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
          await profileService.updatePremiumStatus(sessionResult.session.user.id, true);
          profile.is_premium = true;
        }
      } catch (err) {
        console.error('Exception lors de la vérification de l\'abonnement:', err);
      }
      
      // Nettoyer le nickname s'il contient un @
      const cleanNickname = profile.nickname?.startsWith('@') 
        ? profile.nickname.substring(1) 
        : profile.nickname || '';
      
      setFormData(prev => ({
        ...prev,
        lastName: profile.lastName || '',
        firstName: profile.firstName || '',
        nickname: cleanNickname,
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
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
  }
  const validateForm = (data: ProfileForm) => {
    const errors: string[] = [];
    
    // Nettoyer et valider le pseudo
    const cleanNickname = data.nickname.replace(/^@+/, '').trim();
    
    if (!cleanNickname) {
      errors.push('Le pseudo est requis');
    } else if (cleanNickname.length < 2) {
      errors.push('Le pseudo doit contenir au moins 2 caractères');
    } else if (cleanNickname.length > 50) {
      errors.push('Le pseudo ne peut pas dépasser 50 caractères');
    }
    
    // Validation des mots de passe si fournis
    if (data.password && data.password !== data.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }
    
    if (data.password && data.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    // Validation du site web si fourni
    if (data.website && data.website.trim() && !isValidUrl(data.website)) {
      errors.push('L\'URL du site web n\'est pas valide');
    }
    
    // Validation de la bio
    if (data.bio && data.bio.length > 500) {
      errors.push('La bio ne peut pas dépasser 500 caractères');
    }
    
    return errors;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (formData: ProfileForm) => {
    setLoading(true);
    setError('');

    try {
      // Validation côté client
      const validationErrors = validateForm(formData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      const sessionResult = await authService.getSession();
      if (!sessionResult.session) throw new Error('Non authentifié');

      // Mise à jour du mot de passe si fourni
      if (formData.password && formData.password.trim()) {
        await authService.updatePassword(formData.password, formData.confirmPassword);
      }

      // Upload de la photo de profil si fournie
      let profilePictureUrl = formData.currentProfilePicture;
      if (formData.profilePicture) {
        profilePictureUrl = await profileService.uploadProfilePicture(formData.profilePicture);
      }

      // Mise à jour du profil
      await profileService.updateProfile(sessionResult.session.user.id, {
        lastName: formData.lastName.trim(),
        firstName: formData.firstName.trim(),
        nickname: formData.nickname.replace(/^@+/, '').trim(), // Nettoyer le nickname
        bio: formData.bio.trim(),
        profilePicture: profilePictureUrl,
      });

      router.push('/profile');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour');
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