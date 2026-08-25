// api/checkout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, amount, buyerId } = req.body;

  try {
    // Format items for PayMongo Line Items
    const lineItems = items && items.length > 0 
      ? items.map(item => ({
          currency: 'PHP',
          amount: Math.round(item.price * 100), // PayMongo expects amount in centavos
          name: `${item.title} (${item.selectedVariant || 'Standard'})`,
          quantity: item.quantity || 1
        }))
      : [{
          currency: 'PHP',
          amount: Math.round(amount * 100),
          name: 'Office Supply Checkout',
          quantity: 1
        }];

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            payment_method_types: ['gcash', 'paymaya', 'card', 'dob'],
            line_items: lineItems,
            description: `Order for Buyer ID: ${buyerId || 'Guest'}`
          }
        }
      })
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
    const data = await response.json();

    if (data.data && data.data.attributes && data.data.attributes.checkout_url) {
      return res.status(200).json({ checkoutUrl: data.data.attributes.checkout_url });
    } else {
      return res.status(400).json({ error: 'Failed to create checkout session', details: data });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
