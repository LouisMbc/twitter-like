"use client";

import { useAuth } from '@/hooks/useAuth';

export default function ProfileSetupPage() {
  const { session } = useAuth();
  const user = session?.user;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Configuration du profil</h1>
        {user ? (
          <div>
            <p><strong>Email:</strong> {user.email}</p>
            <p>Complétez votre profil pour continuer.</p>
          </div>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
    </div>
  );
}
