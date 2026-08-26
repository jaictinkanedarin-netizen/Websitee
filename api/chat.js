export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "API Key missing in Vercel settings! 🌸" });
  }

  const prompt = `You are Mochi 🌸, a cute, helpful, and friendly AI assistant for an online stationery shop named OFFICESUPPLY. 
Store Context / Inventory: ${context || 'Various cute stationery items'}. 
User asked: ${message}
Keep your answer cheerful, brief, and helpful.`;

  // List of models to attempt in order
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await apiRes.json();

      if (apiRes.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });
      }
    } catch (err) {
      console.error(`Attempt with ${model} failed:`, err);
    }
  }

  return res.status(500).json({ reply: "Oopsie! Mochi couldn't process that right now. Please try again! 🌸" });
}
