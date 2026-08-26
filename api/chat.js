export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "API Key missing in environment variables! 🌸" });
  }

  const prompt = `You are Mochi 🌸, a cute, helpful, and friendly AI assistant for an online stationery shop named OFFICESUPPLY. 
Store Context / Inventory: ${context || 'Various cute stationery items'}. 
User asked: ${message}
Keep your answer cheerful, brief, and helpful.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(500).json({ reply: "Oopsie! I couldn't reach my AI brain right now. 🌸" });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Konnichiwa! How can I help you today? 🌸";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ reply: "Oopsie! Network connection issue. Please try again! 🌸" });
  }
}  
