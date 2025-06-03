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

  const inputStyle =
    'mt-1 block w-full border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white bg-gray-800';
  const labelStyle = 'block text-sm font-medium text-gray-300 mb-1';

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className={labelStyle}>
            Prénom
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={inputStyle}
            placeholder="Votre prénom"
          />
        </div>

        <div>
          <label htmlFor="lastName" className={labelStyle}>
            Nom
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={inputStyle}
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label htmlFor="nickname" className={labelStyle}>
            Pseudo *
          </label>
          <input
            type="text"
            name="nickname"
            id="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
            className={inputStyle}
            placeholder="Votre pseudo unique"
          />
        </div>

        <div>
          <label htmlFor="bio" className={labelStyle}>
            Bio
          </label>
          <textarea
            name="bio"
            id="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className={inputStyle}
            placeholder="Parlez-nous de vous..."
          />
        </div>

        <div>
          <label htmlFor="password" className={labelStyle}>
            Mot de passe *
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password || ''}
            onChange={handleChange}
            required
            className={inputStyle}
            placeholder="Choisissez un mot de passe"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelStyle}>
            Confirmer le mot de passe *
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword || ''}
            onChange={handleChange}
            required
            className={inputStyle}
            placeholder="Confirmez votre mot de passe"
          />
        </div>

        <div>
          <label htmlFor="profilePicture" className={labelStyle}>
            Photo de profil
          </label>
          <input
            type="file"
            name="profilePicture"
            id="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-700"
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Création du profil...' : 'Créer mon profil'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetupForm;