import { LanguagePreferences } from '@/components/profile/LanguagePreferences';

export default function LanguagePreferencesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Language Settings - MultiluinguiX</h1>
      <LanguagePreferences />
    </div>
  );
}