import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Setup CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "API Key missing in Vercel environment variables! 🌸" });
  }

  try {
    // Initialize the official Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are Mochi 🌸, a cute, helpful, and friendly AI assistant for an online stationery shop named OFFICESUPPLY. 
Store Context / Inventory: ${context || 'Various cute stationery items'}. 
User asked: ${message}
Keep your answer cheerful, brief, and helpful.`;

    // Calling gemini-2.5-flash via the official SDK
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reply = response.text || "Konnichiwa! How can I help you today? 🌸";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Gemini SDK Error:', err);
    return res.status(500).json({ reply: `Gemini Error: ${err.message || 'Failed to process request'}` });
  }
}
