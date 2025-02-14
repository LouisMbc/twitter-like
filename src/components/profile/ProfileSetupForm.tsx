import React from 'react';

interface ProfileSetupFormProps {
  formData: {
    firstName: string;
    lastName: string;
    nickname: string;
    bio: string;
    profilePicture: File | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
}

const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({ formData, setFormData, onSubmit, loading, error }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
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
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
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
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
          Pseudo
        </label>
        <input
          type="text"
          name="nickname"
          id="nickname"
          value={formData.nickname}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
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
        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
          Photo de profil
        </label>
        <input
          type="file"
          name="profilePicture"
          id="profilePicture"
          onChange={(e) => setFormData((prev: any) => ({ ...prev, profilePicture: e.target.files?.[0] || null }))}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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