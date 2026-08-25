const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  const event = req.body.data;

  // Process completed checkout session webhook event
  if (event && event.attributes.type === 'checkout_session.payment.paid') {
    const sessionId = event.attributes.data.id;

    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('paymongo_session_id', sessionId);
  }

  return res.status(200).json({ received: true });
};
