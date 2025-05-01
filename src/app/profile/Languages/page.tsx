"use client";

import { LanguagePreferences } from '@/components/profile/LanguagePreferences';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function LanguagePreferencesPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur-sm p-4 border-b border-gray-800">
        <div className="max-w-2xl mx-auto flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 rounded-full hover:bg-gray-800 mr-4"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold">Préférences linguistiques</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto border-x border-gray-800 p-4">
        <h2 className="text-2xl font-bold mb-6 text-white">Language Settings - MultiluinguiX</h2>
        <LanguagePreferences />
      </div>
    </div>
  );
}