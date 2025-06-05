"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function EditProfilePage() {
  const { 
    formData, 
    setFormData, 
    loading, 
    error, 
    handleSubmit,
    loadProfile 
  } = useProfileEdit();
  const router = useRouter();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const initializeProfile = async () => {
      await loadProfile();
      setIsInitialLoad(false);
    };
    
    initializeProfile();
  }, [loadProfile]);

  // Show loading spinner during initial load
  if (isInitialLoad || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 mr-4 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-xl font-semibold">Modifier le profil</h1>
          </div>
          <button 
            onClick={() => handleSubmit(formData)}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto border-x border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
        <ProfileEditForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
          onCancel={() => router.push('/profile')}
        />
      </div>
    </div>
  );
}