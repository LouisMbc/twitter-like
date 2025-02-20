"use client";

import { useProfileSetup } from '@/hooks/useProfileSetup';
import ProfileSetupForm from '@/components/profile/ProfileSetupForm';

export default function SetupProfilePage() {
  const { formData, setFormData, loading, error, handleSubmit } = useProfileSetup();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Configurer votre profil
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