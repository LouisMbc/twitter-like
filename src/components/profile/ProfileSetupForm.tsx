import React from 'react';
import { ProfileForm } from '@/types';

interface ProfileSetupFormProps {
  formData: ProfileForm;
  setFormData: React.Dispatch<React.SetStateAction<ProfileForm>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({
  formData,
  setFormData,
  handleSubmit,
  loading,
  error,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev: ProfileForm) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // NOUVEAU : Gestion spéciale pour le pseudo avec @
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // S'assurer que le @ est toujours présent au début
    if (!value.startsWith('@')) {
      value = '@' + value;
    }

    // Empêcher les espaces et caractères spéciaux (sauf lettres, chiffres et _)
    value = value.replace(/[^@\w]/g, '');

    setFormData((prev: ProfileForm) => ({
      ...prev,
      nickname: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: ProfileForm) => ({
        ...prev,
        profilePicture: file,
      }));
    } else {
      setFormData((prev: ProfileForm) => ({
        ...prev,
        profilePicture: null,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" method="POST">
      <div className="mb-4">
        <label
          htmlFor="firstName"
          className="block text-sm font-medium text-gray-700"
        >
          Prénom
        </label>
        <input
          type="text"
          name="firstName"
          id="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="lastName"
          className="block text-sm font-medium text-gray-700"
        >
          Nom
        </label>
        <input
          type="text"
          name="lastName"
          id="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-gray-700"
        >
          Pseudo
        </label>
        <input
          type="text"
          name="nickname"
          id="nickname"
          value={formData.nickname}
          onChange={handleNicknameChange} // MODIFIÉ : Utiliser la fonction spéciale
          placeholder="@votrepseudo"
          maxLength={16} // @ + 15 caractères max
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Votre pseudo doit commencer par @ et ne peut contenir que des lettres,
          chiffres et _
        </p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Bio
        </label>
        <textarea
          name="bio"
          id="bio"
          value={formData.bio}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="profilePicture"
          className="block text-sm font-medium text-gray-700"
        >
          Photo de profil
        </label>
        <input
          type="file"
          name="profilePicture"
          id="profilePicture"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Mot de passe
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password || ''}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirmer le mot de passe
        </label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={formData.confirmPassword || ''}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default ProfileSetupForm;