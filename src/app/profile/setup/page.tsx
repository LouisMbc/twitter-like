"use client";

import { useProfileSetup } from '@/hooks/useProfileSetup';
import ProfileSetupForm from '@/components/profile/ProfileSetupForm';
import Image from 'next/image';

export default function SetupProfilePage() {
  const { formData, setFormData, loading, error, handleSubmit } = useProfileSetup();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={120} 
              height={40} 
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Configurez votre profil
          </h1>
          <p className="text-gray-400">
            Personnalisez votre présence sur Flow
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-md mx-auto w-full">
          <ProfileSetupForm
            formData={{
              ...formData,
              profilePicture: formData.profilePicture ?? null
            }}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Ces informations vous aideront à être découvert par d'autres utilisateurs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}