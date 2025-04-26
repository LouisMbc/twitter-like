import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supportedLanguages } from '@/services/translation';
import { getUserLanguagePreferences, updateUserLanguagePreferences } from '@/services/supabase/language';

export function LanguagePreferences() {
  const { session } = useAuth();
  const user = session?.user;
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return;
      
      setIsLoading(true);
      const prefs = await getUserLanguagePreferences(user.id);
      
      if (prefs) {
        setSelectedLanguages(prefs.selectedLanguages);
        setDefaultLanguage(prefs.defaultLanguage);
      } else {
        setSelectedLanguages(['en', 'fr', 'es']);
        setDefaultLanguage('en');
      }
      
      setIsLoading(false);
    }
    
    loadPreferences();
  }, [user]);

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(code)) {
        return prev.filter(lang => lang !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleDefaultLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultLanguage(e.target.value);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    await updateUserLanguagePreferences({
      userId: user.id,
      selectedLanguages,
      defaultLanguage,
    });
    setIsSaving(false);
  };

  if (isLoading) {
    return <div>Loading language preferences...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">MultiluinguiX Preferences</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Selected Languages</h3>
        <p className="text-gray-600 mb-3">Posts and comments will be randomly translated to one of these languages:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {supportedLanguages.map(language => (
            <div key={language.code} className="flex items-center">
              <input
                type="checkbox"
                id={`lang-${language.code}`}
                checked={selectedLanguages.includes(language.code)}
                onChange={() => handleLanguageToggle(language.code)}
                className="mr-2"
              />
              <label htmlFor={`lang-${language.code}`}>
                {language.name} {language.nativeName !== language.name && `(${language.nativeName})`}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Default Language</h3>
        <p className="text-gray-600 mb-3">Used when translation is not available:</p>
        
        <select 
          value={defaultLanguage} 
          onChange={handleDefaultLanguageChange}
          className="w-full p-2 border rounded"
        >
          {supportedLanguages.map(language => (
            <option key={language.code} value={language.code}>
              {language.name} {language.nativeName !== language.name && `(${language.nativeName})`}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}