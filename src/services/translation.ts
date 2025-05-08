// Liste des langues supportées dans l'application
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
];

// Fonction pour traduire un texte
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // Simuler un appel à une API de traduction
    // Dans un environnement de production, vous utiliseriez une véritable API comme Google Translate, DeepL, etc.
    
    // Simulation de la traduction pour les besoins de la démonstration
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple mock de traduction pour la démonstration
        resolve(`[${targetLanguage}] ${text}`);
      }, 500);
    });
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

// Type pour les préférences de langue
export interface UserLanguagePreferences {
  userId: string;
  selectedLanguages: string[];
  defaultLanguage: string;
}
