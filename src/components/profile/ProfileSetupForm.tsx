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
    <div className="bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Créer votre profil
        </h2>
        <p className="text-gray-400">Configurez votre profil pour commencer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div>
          <label htmlFor="nickname" className={labelStyle}>
            Pseudo <span className="text-red-400">*</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className={labelStyle}>
              Mot de passe <span className="text-red-400">*</span>
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
              Confirmer le mot de passe <span className="text-red-400">*</span>
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
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-700 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Création du profil...</span>
            </div>
          ) : (
            'Créer mon profil'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetupForm;