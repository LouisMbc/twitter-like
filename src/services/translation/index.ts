import { Language, TranslatedContent } from '@/types/language';

// Vous pourriez utiliser Google Translate, DeepL, ou une autre API de traduction
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<TranslatedContent> {
  try {
    // Intégration avec l'API de traduction de votre choix
    // Exemple avec une API fictive
    const response = await fetch('https://api.translation-service.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    });

    const data = await response.json();
    
    return {
      originalContent: text,
      translatedContent: data.translatedText,
      detectedLanguage: data.detectedSourceLanguage,
      translatedLanguage: targetLanguage,
    };
  } catch (error) {
    console.error('Translation error:', error);
    // En cas d'erreur, retourner le texte original
    return {
      originalContent: text,
      translatedContent: text,
      detectedLanguage: 'unknown',
      translatedLanguage: 'unknown',
    };
  }
}

// Liste des langues supportées
export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  // Ajoutez d'autres langues selon vos besoins
];

// Sélectionner une langue aléatoire parmi une liste
export function getRandomLanguage(languageCodes: string[]): string {
  if (!languageCodes || languageCodes.length === 0) {
    return 'en'; // Langue par défaut si la liste est vide
  }
  const randomIndex = Math.floor(Math.random() * languageCodes.length);
  return languageCodes[randomIndex];
}