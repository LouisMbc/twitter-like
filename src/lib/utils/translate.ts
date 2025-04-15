export async function translateText(text: string, targetLanguage: string): Promise<string> {
    const response = await fetch(`/api/translate?text=${encodeURIComponent(text)}&lang=${targetLanguage}`);
    const data = await response.json();
    return data.translatedText;
  }
  