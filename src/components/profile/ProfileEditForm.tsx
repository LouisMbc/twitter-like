"use client";

import { useState } from 'react';
import { ProfileForm } from '@/types';

interface ProfileEditFormProps {
  formData: ProfileForm;
  setFormData: React.Dispatch<React.SetStateAction<ProfileForm>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.currentProfilePicture || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFormData((prev: ProfileForm) => ({ ...prev, profilePicture: file }));
    
    // Créer une URL pour la prévisualisation
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="text-white">
      <div className="space-y-6">
        {/* Photo de profil */}
        <div className="flex flex-col items-center mt-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Photo de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl text-gray-300">
                  {formData.firstName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <label 
              htmlFor="profilePicture"
              className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
            >
              <span className="text-xs">+</span>
            </label>
            <input 
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Formulaire */}
        <div className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300">
              Pseudo
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-medium text-white mb-2">Modifier le mot de passe</h3>
            <p className="text-sm text-gray-400 mb-3">Laisser vide pour conserver le mot de passe actuel</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-black border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mt-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-transparent border border-gray-700 rounded-full text-gray-300 text-sm hover:bg-gray-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  );
}