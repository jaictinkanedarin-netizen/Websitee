async function loadDashboardData() {
  const { data: { user } } = await _supabase.auth.getUser();
  if (!user) return switchView('auth');

  const { data: profile } = await _supabase.from('profiles').select('*').eq('id', user.id).single();

  const sellerPanel = document.getElementById('seller-panel');
  const buyerPanel = document.getElementById('buyer-panel');

  if (profile.role === 'seller') {
    sellerPanel.style.display = 'block';
    buyerPanel.style.display = 'none';
    loadSellerSales(user.id);
  } else {
    sellerPanel.style.display = 'none';
    buyerPanel.style.display = 'block';
    loadBuyerHistory(user.id);
  }
}

// 2. User can sell or post their own product
async function handleCreateProduct(e) {
  e.preventDefault();
  const { data: { user } } = await _supabase.auth.getUser();

  const title = document.getElementById('prod-title').value;
  const description = document.getElementById('prod-desc').value;
  const price = parseFloat(document.getElementById('prod-price').value);
  const stock = parseInt(document.getElementById('prod-stock').value);

  const { error } = await _supabase.from('products').insert([
    { seller_id: user.id, title, description, price, stock }
  ]);

  if (error) {
    alert(error.message);
  } else {
    alert('Product listed successfully!');
    document.getElementById('create-product-form').reset();
  }
}

// 3. Seller after login can check its sales history
async function loadSellerSales(sellerId) {
  const container = document.getElementById('seller-history');
  const { data: orders, error } = await _supabase
    .from('orders')
    .select('*, products(title)')
    .eq('seller_id', sellerId);

  if (error || !orders.length) {
    container.innerHTML = '<p>No sales history recorded.</p>';
    return;
  }

  container.innerHTML = orders.map(o => `
    <div class="card">
      <h4>Order #${o.id.substring(0, 8)}</h4>
      <p>Product: ${o.products?.title}</p>
      <p>Amount: ₱${o.amount}</p>
      <p>Status: <strong>${o.status.toUpperCase()}</strong></p>
    </div>
  `).join('');
}

// 4. Buyer after login can check its bought history
async function loadBuyerHistory(buyerId) {
  const container = document.getElementById('buyer-history');
  const { data: orders, error } = await _supabase
    .from('orders')
    .select('*, products(title)')
    .eq('buyer_id', buyerId);

  if (error || !orders.length) {
    container.innerHTML = '<p>No purchase history recorded.</p>';
    return;
  }

  container.innerHTML = orders.map(o => `
    <div class="card">
      <h4>Order #${o.id.substring(0, 8)}</h4>
      <p>Product: ${o.products?.title}</p>
      <p>Amount: ₱${o.amount}</p>
      <p>Status: <strong>${o.status.toUpperCase()}</strong></p>
    </div>
  `).join('');
}
