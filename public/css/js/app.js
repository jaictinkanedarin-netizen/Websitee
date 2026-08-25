// Supabase Public Keys Initialization
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentAuthMode = 'register';

function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add('active');
  
  if (viewName === 'store') loadStoreProducts();
  if (viewName === 'dashboard') loadDashboardData();
}

function updateNavState(user, profile) {
  const loginBtn = document.getElementById('nav-login');
  const logoutBtn = document.getElementById('nav-logout');
  const dashBtn = document.getElementById('nav-dashboard');

  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    dashBtn.style.display = 'block';
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    dashBtn.style.display = 'none';
  }
}

// Global Initialization
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await _supabase.auth.getUser();
  if (user) {
    const { data: profile } = await _supabase.from('profiles').select('*').eq('id', user.id).single();
    updateNavState(user, profile);
  }
});
