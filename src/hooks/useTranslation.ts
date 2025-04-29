import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const useTranslation = (text: string) => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    // Simuler une traduction
    const translate = async () => {
      // Appel à un service de traduction
      const translated = await fakeTranslate(text, language);
      setTranslatedText(translated);
    };

    translate();
  }, [text, language]);

  return translatedText;
};

const fakeTranslate = (text: string, lang: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${text} [translated to ${lang}]`);
    }, 1000);
  });
};

export default useTranslation;
