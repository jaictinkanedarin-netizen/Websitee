export default async function handler(req, res) {
  // Allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body || {};
    const secretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({ error: 'PAYMONGO_SECRET_KEY is missing in Vercel Environment Variables.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are missing or invalid.' });
    }

    // Convert items into PayMongo format (amounts must be in centavos)
    const lineItems = items.map(item => {
      const rawPrice = parseFloat(item.price) || 0;
      const cleanPrice = Math.max(Math.round(rawPrice * 100), 10000); // Minimum 100 PHP (10000 centavos) for PayMongo API
      return {
        name: item.title || item.name || 'Stationery Item',
        amount: cleanPrice,
        currency: 'PHP',
        quantity: parseInt(item.quantity || item.qty || 1, 10)
      };
    });

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const paymongoResponse = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            line_items: lineItems,
            payment_method_types: ['card', 'gcash', 'paymaya', 'grab_pay'],
            success_url: `${origin}/checkout.html?status=success`,
            cancel_url: `${origin}/checkout.html`
          }
        }
      })
    });

    const data = await paymongoResponse.json();

    if (data.errors) {
      return res.status(400).json({ error: data.errors[0].detail });
    }

    return res.status(200).json({ checkoutUrl: data.data.attributes.checkout_url });

  } catch (error) {
    console.error('PayMongo API Error:', error);
    return res.status(500).json({ error: 'Internal server error while connecting to PayMongo.' });
  }
}
