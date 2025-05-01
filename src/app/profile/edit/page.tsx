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
          <div className="animate-pulse flex justify-center">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={120} 
              height={40} 
              priority
            />
          </div>
          <div className="mt-4">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur-sm p-4 border-b border-gray-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-gray-800 mr-4"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-xl font-bold">Modifier le profil</h1>
          </div>
          <button 
            onClick={() => handleSubmit(formData)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full font-bold"
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