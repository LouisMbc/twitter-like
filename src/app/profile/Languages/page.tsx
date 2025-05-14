"use client";

import { LanguagePreferences } from '@/components/profile/LanguagePreferences';
import Header from '@/components/shared/Header';

export default function LanguagePreferencesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-2xl mx-auto border-x border-gray-800 p-4">
        <h2 className="text-2xl font-bold mb-6 text-white">Language Settings - MultiluinguiX</h2>
        <LanguagePreferences />
      </div>
    </div>
  );
}