const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, description, buyerEmail } = req.body;

  if (!amount || !buyerEmail) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: { email: buyerEmail },
            line_items: [
              {
                currency: 'PHP',
                amount: Math.round(amount * 100), // Paymongo works in centavos
                description: description || 'Office Supplies Order',
                name: 'Office Supply Purchase',
                quantity: 1
              }
            ],
            payment_method_types: ['gcash', 'card', 'paymaya'],
            success_url: `${process.env.PUBLIC_URL || 'http://localhost:3000'}?payment=success`,
            cancel_url: `${process.env.PUBLIC_URL || 'http://localhost:3000'}?payment=cancelled`
          }
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Paymongo API error');
    }

    return res.status(200).json({ checkoutUrl: data.data.attributes.checkout_url, id: data.data.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
