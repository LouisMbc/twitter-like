"use client";

import { useProfileSetup } from '@/hooks/useProfileSetup';
import ProfileSetupForm from '@/components/profile/ProfileSetupForm';
import Image from 'next/image';

export default function SetupProfilePage() {
  const { formData, setFormData, loading, error, handleSubmit } = useProfileSetup();

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-md p-8 border border-gray-800">
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo_Flow.png" 
            alt="Flow Logo" 
            width={120} 
            height={40} 
            priority
          />
        </div>
        <h2 className="text-xl font-bold text-center mb-8">
          Complétez votre profil
        </h2>
        <ProfileSetupForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}