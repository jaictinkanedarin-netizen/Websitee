const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Auth status navigation updates
  const authLink = document.getElementById('auth-link');
  if (authLink && session) {
    authLink.textContent = 'Dashboard';
    authLink.href = 'dashboard.html';
  }

  // Bind Authentication Events
  const btnSignup = document.getElementById('btn-signup');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');

  if (btnSignup) {
    btnSignup.addEventListener('click', async () => {
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;
      const gcash = document.getElementById('auth-gcash').value;

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return alert(error.message);

      if (data.user) {
        await supabase.from('profiles').insert([{ id: data.user.id, email, gcash_number: gcash }]);
        alert('Registration successful!');
        window.location.href = 'dashboard.html';
      }
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert(error.message);
      window.location.href = 'dashboard.html';
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    });
  }

  // Load Catalog items
  if (document.getElementById('store-products') || document.getElementById('featured-products')) {
    loadProducts();
  }

  // Handle Product Listing Insertion
  const productForm = document.getElementById('add-product-form');
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!session) return alert('Must be logged in');

      const title = document.getElementById('p-title').value;
      const description = document.getElementById('p-desc').value;
      const price = parseFloat(document.getElementById('p-price').value);
      const image_url = document.getElementById('p-image').value;

      const { error } = await supabase.from('products').insert([
        { seller_id: session.user.id, title, description, price, image_url }
      ]);

      if (error) alert(error.message);
      else location.reload();
    });
  }

  // Load Dashboard Histories
  if (window.location.pathname.includes('dashboard.html')) {
    if (!session) return window.location.href = 'auth.html';
    loadHistories(session.user.id);
  }
});

async function loadProducts() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) return;

  const target = document.getElementById('store-products') || document.getElementById('featured-products');
  target.innerHTML = '';

  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${prod.image_url}" alt="${prod.title}">
      <h4>${prod.title}</h4>
      <p>${prod.description}</p>
      <p><strong>PHP ${prod.price}</strong></p>
      <button onclick="buyProduct('${prod.id}', ${prod.price})" class="btn-cta" style="margin-top:1rem;">Buy via GCash</button>
      <div style="margin-top:1rem;">
        <small>Leave a Review:</small>
        <select id="star-${prod.id}">
          <option value="5">5 ★</option>
          <option value="4">4 ★</option>
          <option value="3">3 ★</option>
          <option value="2">2 ★</option>
          <option value="1">1 ★</option>
        </select>
        <input type="text" id="review-${prod.id}" placeholder="Comment">
        <button onclick="submitReview('${prod.id}')">Submit</button>
      </div>
    `;
    target.appendChild(card);
  });
}

async function buyProduct(productId, price) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return alert('Login required to complete purchase.');

  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, amount: price, buyerId: session.user.id })
  });
  const data = await res.json();
  if (data.checkoutUrl) {
    window.location.href = data.checkoutUrl;
  } else {
    alert('Failed to initiate PayMongo session.');
  }
}

async function submitReview(productId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return alert('Login required to leave a review.');

  const rating = document.getElementById(`star-${productId}`).value;
  const comment = document.getElementById(`review-${productId}`).value;

  const { error } = await supabase.from('reviews').insert([
    { product_id: productId, buyer_id: session.user.id, rating: parseInt(rating), comment }
  ]);

  if (error) alert(error.message);
  else alert('Review submitted!');
}

async function loadHistories(userId) {
  // Sales History
  const { data: sales } = await supabase.from('orders').select('*, products(title)').eq('seller_id', userId);
  const salesContainer = document.getElementById('sales-history');
  if (salesContainer) {
    salesContainer.innerHTML = sales?.map(s => `<div class="card"><p>Product: ${s.products?.title}</p><p>Amount: PHP ${s.amount}</p><p>Status: ${s.status}</p></div>`).join('') || '<p>No sales yet.</p>';
  }

  // Purchase History
  const { data: purchases } = await supabase.from('orders').select('*, products(title)').eq('buyer_id', userId);
  const purchaseContainer = document.getElementById('purchase-history');
  if (purchaseContainer) {
    purchaseContainer.innerHTML = purchases?.map(p => `<div class="card"><p>Product: ${p.products?.title}</p><p>Amount: PHP ${p.amount}</p><p>Status: ${p.status}</p></div>`).join('') || '<p>No purchases yet.</p>';
  }
}
