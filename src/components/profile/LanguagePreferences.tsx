"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supportedLanguages } from '@/services/translation';
import { getUserLanguagePreferences, updateUserLanguagePreferences } from '@/services/supabase/language';

export function LanguagePreferences() {
  const { user } = useAuth();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use useEffect to ensure this only runs client-side
  useEffect(() => {
    let isMounted = true;
    async function loadPreferences() {
      if (!user) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      try {
        const prefs = await getUserLanguagePreferences(user.id);
        
        if (!isMounted) return;
        
        if (prefs) {
          setSelectedLanguages(prefs.selectedLanguages || ['en', 'fr', 'es']);
          setDefaultLanguage(prefs.defaultLanguage || 'en');
        } else {
          setSelectedLanguages(['en', 'fr', 'es']);
          setDefaultLanguage('en');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load language preferences:', err);
          setError('Failed to load language preferences. Please try again later.');
          setSelectedLanguages(['en', 'fr', 'es']);
          setDefaultLanguage('en');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    loadPreferences();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages(prev => {
      // Don't remove the last language
      if (prev.includes(code) && prev.length > 1) {
        return prev.filter(lang => lang !== code);
      } else if (!prev.includes(code)) {
        return [...prev, code];
      }
      return prev;
    });
  };

  const handleDefaultLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultLanguage(e.target.value);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserLanguagePreferences({
        userId: user.id,
        selectedLanguages,
        defaultLanguage,
      });
    } catch (err) {
      console.error('Failed to save language preferences:', err);
      setError('Failed to save preferences. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-center">Loading language preferences...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">MultiluinguiX Preferences</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
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
                disabled={selectedLanguages.length === 1 && selectedLanguages.includes(language.code)}
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