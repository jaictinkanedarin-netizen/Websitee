async function loadStoreProducts() {
  const container = document.getElementById('product-list');
  container.innerHTML = '<p>Loading products...</p>';

  const { data: products, error } = await _supabase
    .from('products')
    .select('*, reviews(*)');

  if (error) {
    container.innerHTML = '<p>Error loading products.</p>';
    return;
  }

  container.innerHTML = '';
  products.forEach(prod => {
    const avgRating = prod.reviews.length 
      ? (prod.reviews.reduce((acc, r) => acc + r.rating, 0) / prod.reviews.length).toFixed(1)
      : 'No ratings';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${prod.title}</h3>
      <p>${prod.description}</p>
      <div class="star-rating">★ ${avgRating} (${prod.reviews.length} reviews)</div>
      <div class="price">₱${parseFloat(prod.price).toFixed(2)}</div>
      <button onclick="triggerCheckout('${prod.id}', ${prod.price}, '${prod.seller_id}')" class="btn btn-primary">Buy Now via Paymongo</button>
      
      <div style="margin-top: 1.5rem; border-top: 1px solid #E2E8F0; padding-top: 1rem;">
        <h4>Add Review</h4>
        <select id="rating-${prod.id}" style="margin-bottom: 0.5rem; width: 100%; padding: 0.25rem;">
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <input type="text" id="comment-${prod.id}" placeholder="Write a review..." style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem;">
        <button onclick="submitReview('${prod.id}')" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Submit Review</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// 1. Paymongo Payment Integration Handling
async function triggerCheckout(productId, amount, sellerId) {
  const { data: { user } } = await _supabase.auth.getUser();
  if (!user) {
    alert('Please login to purchase products.');
    return switchView('auth');
  }

  try {
    const response = await fetch('/api/paymongo-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description: 'Office Supply Item', buyerEmail: user.email })
    });

    const data = await response.json();
    if (data.checkoutUrl) {
      // Record order locally as pending
      await _supabase.from('orders').insert([
        {
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId,
          amount: amount,
          paymongo_payment_intent_id: data.id,
          status: 'pending'
        }
      ]);
      // Redirect to external checkout
      window.location.href = data.checkoutUrl;
    } else {
      alert('Checkout error: ' + data.error);
    }
  } catch (err) {
    alert('Payment initialization failed.');
  }
}

// 7. Product Reviews and Ratings (Star Format)
async function submitReview(productId) {
  const { data: { user } } = await _supabase.auth.getUser();
  if (!user) return alert('Please login to leave a review.');

  const rating = document.getElementById(`rating-${productId}`).value;
  const comment = document.getElementById(`comment-${productId}`).value;

  const { error } = await _supabase.from('reviews').insert([
    { product_id: productId, buyer_id: user.id, rating: parseInt(rating), comment }
  ]);

  if (error) {
    alert(error.message);
  } else {
    alert('Review submitted successfully!');
    loadStoreProducts();
  }
}
