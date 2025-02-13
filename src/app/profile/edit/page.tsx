"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import ProfileEditForm from '@/components/profile/ProfileEditForm';

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
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Modifier le profil</h1>
      <ProfileEditForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        error={error}
        loading={loading}
        onCancel={() => router.push('/profile')}
      />
    </div>
  );
}