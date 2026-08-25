const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const event = req.body;

  if (event?.data?.attributes?.type === 'checkout_session.payment.paid') {
    const session = event.data.attributes.data;
    const checkoutSessionId = session.id;

    // Update the corresponding order status in Supabase
    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('paymongo_payment_intent_id', checkoutSessionId);

    if (error) {
      console.error('Database update error:', error);
      return res.status(500).send('Database Error');
    }
  }

  return res.status(200).json({ received: true });
};
