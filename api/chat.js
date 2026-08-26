export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Temporary test key replacement
  const apiKey = process.env.OPENAI_API_KEY || "YOUR_ACTUAL_OPENAI_KEY_HERE";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Mochi, a helpful assistant.' },
          { role: 'user', content: req.body.message || "Hello" }
        ]
      })
    });

    const data = await response.json();
    
    // Return explicit error details to frontend if OpenAI rejects it
    if (data.error) {
      return res.status(500).json({ reply: `OpenAI Error: ${data.error.message}` });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ reply: `Server Error: ${err.message}` });
  }
}
