export default async function handler(req, res) {
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

  const prompt = `You are Mochi 🌸, a cute, helpful, and friendly AI assistant for an online stationery shop named OFFICESUPPLY. 
Store Context / Inventory: ${context || 'Various cute stationery items'}. 
User asked: ${message}
Keep your answer cheerful, brief, and helpful.`;

  try {
    // Updated to gemini-2.0-flash endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await apiRes.json();

    if (!apiRes.ok || data.error) {
      console.error('Google Gemini Error:', data.error);
      return res.status(500).json({ reply: `Gemini Error: ${data.error?.message || 'Failed to process request'}` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Konnichiwa! How can I help you today? 🌸";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ reply: "Oopsie! Network connection issue. Please try again! 🌸" });
  }
}
