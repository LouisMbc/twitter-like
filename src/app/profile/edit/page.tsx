"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';

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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-center py-20">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={100} 
              height={32} 
              priority
            />
          </div>
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-gray-800 mr-4 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-xl font-semibold">Modifier le profil</h1>
          </div>
          <button 
            onClick={() => handleSubmit(formData)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto border-x border-gray-800 p-4">
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