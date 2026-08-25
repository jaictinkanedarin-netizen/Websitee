const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { productId, amount, buyerId } = req.body;

  try {
    // 1. Fetch Product for Seller info
    const { data: product } = await supabase.from('products').select('seller_id, title').eq('id', productId).single();

    // 2. Call PayMongo API to create Checkout Session
    const response = await axios.post('https://api.paymongo.com/v1/checkout_sessions', {
      data: {
        attributes: {
          line_items: [{
            currency: 'PHP',
            amount: Math.round(amount * 100), // convert to centavos
            name: product.title,
            quantity: 1
          }],
          payment_method_types: ['gcash', 'card'],
          success_url: `${req.headers.origin}/dashboard.html`,
          cancel_url: `${req.headers.origin}/store.html`
        }
      }
    }, {
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    const sessionId = response.data.data.id;
    const checkoutUrl = response.data.data.attributes.checkout_url;

    // 3. Register transaction record in Pending state
    await supabase.from('orders').insert([{
      buyer_id: buyerId,
      seller_id: product.seller_id,
      product_id: productId,
      amount: amount,
      status: 'pending',
      paymongo_session_id: sessionId
    }]);

    return res.status(200).json({ checkoutUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
