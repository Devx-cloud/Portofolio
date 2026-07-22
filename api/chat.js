import { GoogleGenerativeAI } from '@google/generative-ai';
import { profileData } from './profile.js';



export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ message: 'API key is missing' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `
      ${profileData.pesan_sistem}
      
      Informasi Profil:
      Nama: ${profileData.nama}
      Profesi: ${profileData.profesi}
      Keahlian: ${profileData.keahlian_utama.join(', ')}
      Tentang: ${profileData.tentang}
      Kontak/Resume: ${profileData.kontak.resume}
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nPertanyaan Pengunjung: ${message}` }]
        }
      ]
    });

    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ message: 'Error: ' + (error.message || 'Internal Server Error') });
  }
}
