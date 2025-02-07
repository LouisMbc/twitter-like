const languages = ["en", "fr", "es", "de", "it", "ja", "ru"]; 

export function getRandomLanguage() {
  return languages[Math.floor(Math.random() * languages.length)];
}

export async function translateText(text) {
  const targetLang = getRandomLanguage();
  const response = await fetch(`https://api.mymemory.translated.net/get?q=${text}&langpair=auto|${targetLang}`);
  const data = await response.json();
  return data.responseData.translatedText || text;
}
