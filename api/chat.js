export default async function handler(req, res) {
  // Allow requests from your frontend
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are Mochi, a super cute, helpful assistant for "Kane\'s Office Supply" store. Keep responses friendly, sweet, and brief with cute emojis!' 
          },
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await response.json();

    // Check if OpenAI returned an API error (e.g., bad key, billing)
    if (data.error) {
      console.error('OpenAI Error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Server connection failed' });
  }
}
