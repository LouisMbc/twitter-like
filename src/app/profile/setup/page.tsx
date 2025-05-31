"use client";

import { useProfileSetup } from '@/hooks/useProfileSetup';
import ProfileSetupForm from '@/components/profile/ProfileSetupForm';
import Image from 'next/image';

export default function SetupProfilePage() {
  const { formData, setFormData, loading, error, handleSubmit } = useProfileSetup();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
            Configurez votre profil
          </h1>
          <p className="text-gray-400 text-lg">
            Personnalisez votre présence sur Flow
          </p>
        </div>

        <div className="max-w-md mx-auto w-full">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 rounded-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <Image 
                    src="/logo_Flow.png" 
                    alt="Flow Logo" 
                    width={120} 
                    height={40} 
                    priority
                    className="relative z-10 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-8 text-white">
                Dernière étape !
              </h2>
              
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
                <p className="text-sm text-gray-400">
                  Ces informations vous aideront à être découvert par d'autres utilisateurs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}