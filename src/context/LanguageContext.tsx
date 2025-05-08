'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Simple translations
const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome',
    posts: 'Posts',
    comments: 'Comments',
    media: 'Media',
    likes: 'Likes'
  },
  fr: {
    welcome: 'Bienvenue',
    posts: 'Publications',
    comments: 'Commentaires',
    media: 'Médias',
    likes: 'J\'aime'
  },
  es: {
    welcome: 'Bienvenido',
    posts: 'Publicaciones',
    comments: 'Comentarios',
    media: 'Medios',
    likes: 'Me gusta'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('fr');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && Object.keys(translations).includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string, fallback?: string) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
