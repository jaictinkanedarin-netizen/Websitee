export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is undefined in Vercel settings.');
    return res.status(500).json({ reply: "API Key missing in Vercel environment variables! 🌸" });
  }

  const prompt = `You are Mochi 🌸, a cute assistant for OFFICESUPPLY. Inventory: ${context || 'Stationery'}. User: ${message}`;

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await apiRes.json();

    if (!apiRes.ok || data.error) {
      console.error('GOOGLE GEMINI REJECTION:', JSON.stringify(data));
      return res.status(500).json({ reply: `Gemini Error: ${data.error?.message || 'Failed to generate'}` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Konnichiwa! 🌸";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('FETCH ERROR:', err);
    return res.status(500).json({ reply: "Network connection error! 🌸" });
  }
}
