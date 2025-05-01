import { useState } from 'react';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  fr: {
    comments: 'Commentaires',
    noComments: 'Aucun commentaire',
    writeComment: 'Écrire un commentaire',
    post: 'Publier',
    reply: 'Répondre',
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    // Add more translations as needed
  },
  en: {
    comments: 'Comments',
    noComments: 'No comments',
    writeComment: 'Write a comment',
    post: 'Post',
    reply: 'Reply',
    loading: 'Loading...',
    error: 'An error occurred',
    // Add more translations as needed
  },
};

export function useTranslation() {
  // You could get this from user preferences or browser settings
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  
  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  const changeLocale = (newLocale: 'fr' | 'en') => {
    setLocale(newLocale);
  };
  
  return {
    t,
    locale,
    changeLocale,
  };
}

// Make sure to export the hook as the default export as well
export default useTranslation;
