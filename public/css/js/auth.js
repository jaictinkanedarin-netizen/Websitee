function toggleAuthMode(e) {
  e.preventDefault();
  const title = document.querySelector('#view-auth h2');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleBtn = document.getElementById('auth-toggle-btn');
  const fullnameGrp = document.getElementById('group-fullname');
  const gcashGrp = document.getElementById('group-gcash');
  const roleGrp = document.getElementById('group-role');

  if (currentAuthMode === 'register') {
    currentAuthMode = 'login';
    title.innerText = 'Account Login';
    submitBtn.innerText = 'Sign In';
    toggleBtn.innerText = "Don't have an account? Register";
    fullnameGrp.style.display = 'none';
    gcashGrp.style.display = 'none';
    roleGrp.style.display = 'none';
  } else {
    currentAuthMode = 'register';
    title.innerText = 'Account Access';
    submitBtn.innerText = 'Register Account';
    toggleBtn.innerText = 'Already have an account? Login';
    fullnameGrp.style.display = 'block';
    gcashGrp.style.display = 'block';
    roleGrp.style.display = 'block';
  }
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  if (currentAuthMode === 'register') {
    const fullName = document.getElementById('auth-fullname').value;
    const gcaNumber = document.getElementById('auth-gcash').value;
    const role = document.getElementById('auth-role').value;

    const { data, error } = await _supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);

    if (data.user) {
      const { error: profileError } = await _supabase.from('profiles').insert([
        { id: data.user.id, full_name: fullName, gca_number: gcaNumber, role }
      ]);
      if (profileError) return alert(profileError.message);
      alert('Registration successful!');
      location.reload();
    }
  } else {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    alert('Logged in successfully!');
    location.reload();
  }
}

async function handleLogout() {
  await _supabase.auth.signOut();
  location.reload();
}
