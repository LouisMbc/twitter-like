export interface Language {
    code: string;
    name: string;
    nativeName?: string;
}

export interface UserLanguagePreferences {
    userId: string;
    selectedLanguages: string[];
    defaultLanguage: string;
}

export interface TranslatedContent {
    originalContent: string;
    translatedContent: string;
    detectedLanguage: string;
    translatedLanguage: string;
}