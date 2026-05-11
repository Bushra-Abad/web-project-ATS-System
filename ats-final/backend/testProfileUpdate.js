require('dotenv').config();
const fetch = global.fetch;
(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email: 'admin@techhire.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('login status', loginRes.status, loginData);
    const token = loginData.token;
    const updateRes = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type':'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Test Profile Save', phone: '+92-300-1234567' })
    });
    const updateData = await updateRes.json();
    console.log('update status', updateRes.status, updateData);
  } catch (err) {
    console.error('fetch error', err);
  }
})();