import { NextApiRequest, NextApiResponse } from 'next';
import { translate } from '@vitalets/google-translate-api'; // Exemple avec l'API de Google Translate

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text, lang } = req.query;

  if (!text || !lang) {
    return res.status(400).json({ error: 'Text and language are required' });
  }

  try {
    const translation = await translate(text as string, { to: lang as string });
    res.status(200).json({ translatedText: translation.text });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
}
