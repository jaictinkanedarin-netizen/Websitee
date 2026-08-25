const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files
app.use(express.static('.'));

// Automatic Chat API Endpoint
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    // API key stored safely in environment variables on the server
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are Paimon from Genshin Impact, acting as a helpful and cute guide for TEYVAT SUPPLY. Be energetic, cute, slightly quirky (refer to yourself as Paimon sometimes), and concise. User question: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return res.json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            return res.status(500).json({ error: 'Failed to generate response from Archons.' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal server connection error.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Teyvat Supply server active on port ${PORT}`));
