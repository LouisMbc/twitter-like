export interface Language {
    code: string;
    name: string;
    nativeName?: string;
  }
  
  export interface UserLanguagePreferences {
    userId: string;
    selectedLanguages: string[]; // codes des langues
    defaultLanguage: string; // code de la langue par défaut
  }
  
  export interface TranslatedContent {
    originalContent: string;
    translatedContent: string;
    detectedLanguage: string;
    translatedLanguage: string;
  }