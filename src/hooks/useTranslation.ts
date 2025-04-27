import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserLanguagePreferences } from '@/services/supabase/language';
import { translateText, getRandomLanguage, supportedLanguages } from '@/services/translation';
import { TranslatedContent } from '@/types/language';

export function useTranslation() {
  const { user } = useAuth();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserPreferences() {
      if (!user) return;
      
      setIsLoading(true);
      const preferences = await getUserLanguagePreferences(user.id);
      
      if (preferences) {
        setSelectedLanguages(preferences.selectedLanguages);
        setDefaultLanguage(preferences.defaultLanguage);
      } else {
        // Valeurs par défaut si l'utilisateur n'a pas encore de préférences
        setSelectedLanguages(['en', 'fr', 'es']);
        setDefaultLanguage('en');
      }
      
      setIsLoading(false);
    }
    
    loadUserPreferences();
  }, [user]);

  async function translateContent(content: string): Promise<TranslatedContent> {
    if (isLoading || selectedLanguages.length === 0) {
      return {
        originalContent: content,
        translatedContent: content,
        detectedLanguage: 'unknown',
        translatedLanguage: defaultLanguage,
      };
    }
    
    const targetLanguage = getRandomLanguage(selectedLanguages);
    return await translateText(content, targetLanguage);
  }

  return {
    translateContent,
    selectedLanguages,
    defaultLanguage,
    supportedLanguages,
    isLoading,
  };
}