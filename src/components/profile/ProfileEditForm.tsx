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

  // Initialiser la photo de profil avec l'image existante
  useEffect(() => {
    if (formData?.currentProfilePicture) {
      setPreviewUrl(formData.currentProfilePicture);
    }
  }, [formData?.currentProfilePicture]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFormData(prev => ({ ...prev, profilePicture: file }));
    
    // Créer une URL pour la prévisualisation
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="text-gray-900 dark:text-white transition-colors duration-300">
      {/* Cover Photo Section */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-800 mb-16 transition-colors duration-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <label className="cursor-pointer p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>
        
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
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-gray-600 dark:text-gray-300">
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
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Fields */}
        <div className="space-y-6">
          <div>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData?.nickname || ''}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-700 py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg"
              placeholder={formData?.nickname || "Votre_Pseudo"}
            />
          </div>

          <div>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData?.firstName || ''}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-700 py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg"
              placeholder={formData?.firstName || "Votre_Nom"}
            />
          </div>

          <div>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData?.lastName || ''}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-700 py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg"
              placeholder={formData?.lastName || "Votre_Prénom"}
            />
          </div>

          <div>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData?.bio || ''}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-700 py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg resize-none"
              placeholder={formData?.bio || "Bio"}
            />
          </div>

          <div>
            <input
              type="url"
              id="website"
              name="website"
              value={formData?.website || ''}
              onChange={handleChange}
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-700 py-3 px-0 text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-red-500 transition-colors duration-300 text-lg"
              placeholder={formData?.website || "https://votre-site.com"}
            />
          </div>
        </div>

        {/* Date de naissance */}
        <div className="py-4">
          <div className="flex items-center justify-between py-4 border-b-2 border-gray-300 dark:border-gray-700">
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">Date de naissance</p>
              <p className="text-sm text-red-500">31 juillet 2004</p>
            </div>
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
            className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 disabled:opacity-50 transition-colors duration-300"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}