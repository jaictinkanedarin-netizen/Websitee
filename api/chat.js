export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: 'Error: GEMINI_API_KEY is missing in Vercel settings.' });
  }

  const userMessage = req.body.message || 'Hello';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are Mochi, a helpful customer support AI for "Kane's Office Supply" store. 
                  Keep responses friendly, helpful, brief, and cute with emojis! 
                  Provide step-by-step instructions when explaining store tasks.
                  
                  Customer asked: ${userMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: `Gemini Error: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ reply: `Server Error: ${err.message}` });
  }
}
