import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserLanguagePreferences } from '@/services/supabase/language';
import { supportedLanguages } from '@/services/translation';

interface LanguageContextType {
  selectedLanguages: string[];
  defaultLanguage: string;
  isLoading: boolean;
  supportedLanguages: { code: string; name: string; nativeName?: string }[];
  updateSelectedLanguages: (languages: string[]) => void;
  updateDefaultLanguage: (language: string) => void;
  savePreferences: () => Promise<boolean>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'fr', 'es']);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPreferences() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const prefs = await getUserLanguagePreferences(user.id);
      
      if (prefs) {
        setSelectedLanguages(prefs.selectedLanguages);
        setDefaultLanguage(prefs.defaultLanguage);
      }
      
      setIsLoading(false);
    }
    
    loadPreferences();
  }, [user]);

  const updateSelectedLanguages = (languages: string[]) => {
    setSelectedLanguages(languages);
  };
  
  const updateDefaultLanguage = (language: string) => {
    setDefaultLanguage(language);
  };
  
  const savePreferences = async () => {
    if (!user) return false;
    
    const { updateUserLanguagePreferences } = await import('@/services/supabase/language');
    
    return await updateUserLanguagePreferences({
      userId: user.id,
      selectedLanguages,
      defaultLanguage,
    });
  };

  return (
    <LanguageContext.Provider value={{
      selectedLanguages,
      defaultLanguage,
      isLoading,
      supportedLanguages,
      updateSelectedLanguages,
      updateDefaultLanguage,
      savePreferences,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}