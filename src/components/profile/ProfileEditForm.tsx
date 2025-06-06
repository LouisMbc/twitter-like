"use client";

import { useState, useEffect } from 'react';
import { ProfileForm } from '@/types';

interface ProfileEditFormProps {
  formData: ProfileForm;
  setFormData: React.Dispatch<React.SetStateAction<ProfileForm>>;
  onSubmit: (formData: ProfileForm) => Promise<void>;
  error: string;
  loading: boolean;
  onCancel: () => void;
}

export default function ProfileEditForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  error, 
  loading,
  onCancel
}: ProfileEditFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser les photos avec les images existantes
  useEffect(() => {
    if (formData?.currentProfilePicture) {
      setPreviewUrl(formData.currentProfilePicture);
    }
    if (formData?.currentCoverPicture) {
      setCoverPreviewUrl(formData.currentCoverPicture);
    }
  }, [formData?.currentProfilePicture, formData?.currentCoverPicture]);

  // Nettoyer les URLs d'objets au démontage
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [previewUrl, coverPreviewUrl]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'nickname':
        if (value.length < 3) {
          newErrors[name] = 'Le pseudo doit contenir au moins 3 caractères';
        } else if (value.length > 20) {
          newErrors[name] = 'Le pseudo ne peut pas dépasser 20 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'firstName':
        if (value.length > 50) {
          newErrors[name] = 'Le nom ne peut pas dépasser 50 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'lastName':
        if (value.length > 50) {
          newErrors[name] = 'Le prénom ne peut pas dépasser 50 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'bio':
        if (value.length > 280) {
          newErrors[name] = 'La bio ne peut pas dépasser 280 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'website':
        if (value && !value.match(/^https?:\/\/.+/)) {
          newErrors[name] = 'L\'URL doit commencer par http:// ou https://';
        } else {
          delete newErrors[name];
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [type]: 'Le fichier doit être une image' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setErrors(prev => ({ ...prev, [type]: 'L\'image ne peut pas dépasser 5MB' }));
      return;
    }

    // Supprimer l'erreur si elle existait
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });

    if (type === 'profile') {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      // Nettoyer l'ancienne URL
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setFormData(prev => ({ ...prev, coverPicture: file }));
      // Nettoyer l'ancienne URL
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
      const url = URL.createObjectURL(file);
      setCoverPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier s'il y a des erreurs
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Validation finale
    if (!formData.nickname || formData.nickname.length < 3) {
      setErrors(prev => ({ ...prev, nickname: 'Le pseudo est requis (minimum 3 caractères)' }));
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="text-gray-900 dark:text-white transition-colors duration-300">
      {/* Cover Photo Section */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-800 mb-16 transition-colors duration-300 overflow-hidden">
        {coverPreviewUrl ? (
          <img
            src={coverPreviewUrl}
            alt="Photo de couverture"
            className="w-full h-full object-cover"
            onError={() => setCoverPreviewUrl(null)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800"></div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <label className="cursor-pointer p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'cover')}
            />
          </label>
        </div>
        
        {errors.cover && (
          <div className="absolute bottom-2 left-2 right-2 bg-red-900/80 text-red-200 px-3 py-1 rounded text-sm">
            {errors.cover}
          </div>
        )}
        
        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-black transition-colors duration-300">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Photo de profil"
                className="w-full h-full object-cover"
                onError={() => setPreviewUrl(null)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-400 to-red-600">
                <span className="text-4xl text-white font-bold">
                  {(formData?.nickname || formData?.firstName || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <label className="absolute inset-0 cursor-pointer bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full transition-all flex items-center justify-center group">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'profile')}
                className="hidden"
              />
            </label>
          </div>
          {errors.profile && (
            <div className="absolute top-full left-0 mt-2 bg-red-900/80 text-red-200 px-2 py-1 rounded text-xs whitespace-nowrap">
              {errors.profile}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Fields */}
        <div className="space-y-6">
          <div>
            <label htmlFor="nickname" className="sr-only">Pseudo</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData?.nickname || ''}
              onChange={handleChange}
              className={`w-full bg-transparent border-0 border-b-2 ${
                errors.nickname ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg`}
              placeholder="Votre pseudo"
              required
            />
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-500">{errors.nickname}</p>
            )}
          </div>

          <div>
            <label htmlFor="firstName" className="sr-only">Nom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData?.firstName || ''}
              onChange={handleChange}
              className={`w-full bg-transparent border-0 border-b-2 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg`}
              placeholder="Votre nom"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="sr-only">Prénom</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData?.lastName || ''}
              onChange={handleChange}
              className={`w-full bg-transparent border-0 border-b-2 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg`}
              placeholder="Votre prénom"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="sr-only">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData?.bio || ''}
              onChange={handleChange}
              className={`w-full bg-transparent border-0 border-b-2 ${
                errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg resize-none`}
              placeholder="Votre bio"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {(formData?.bio || '').length}/280
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="website" className="sr-only">Site web</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData?.website || ''}
              onChange={handleChange}
              className={`w-full bg-transparent border-0 border-b-2 ${
                errors.website ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg`}
              placeholder="https://votre-site.com"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-500">{errors.website}</p>
            )}
          </div>
        </div>

        {/* Date de naissance */}
        <div className="py-4">
          <div className="flex items-center justify-between py-4 border-b-2 border-gray-300 dark:border-gray-700">
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">Date de naissance</p>
              <p className="text-sm text-red-500">31 juillet 2004</p>
            </div>
            <button
              type="button"
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Modifier
            </button>
          </div>
        </div>

        {/* Options supplémentaires */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <span className="text-lg font-medium text-gray-900 dark:text-white">Créer une biographie détaillée</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <span className="text-lg font-medium text-gray-900 dark:text-white">Passer en mode Professionnel</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="px-6 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 disabled:opacity-50 transition-colors duration-300"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}