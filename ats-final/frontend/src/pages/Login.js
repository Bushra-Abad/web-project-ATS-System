import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Login = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isAdmin, setIsAdmin]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const { login }                 = useContext(AuthContext);
  const { darkMode }              = useContext(ThemeContext);
  const navigate                  = useNavigate();

  const dm = darkMode;

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isAdmin && !adminCode) {
      setError('Admin login requires the secret code.');
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    
    const res = await login(normalizedEmail, password, isAdmin ? adminCode : null);

    setLoading(false);

    if (res.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'candidate') {
        navigate('/candidate/dashboard');
      } else {
        navigate('/hr/dashboard');
      }
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const s = {
    container: { 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '80vh', padding: '2rem', background: 'var(--bg-color)',
      transition: 'all 0.3s ease'
    },
    card: { 
      background: 'var(--card-bg)', padding: '3rem 2.5rem', borderRadius: '12px', 
      boxShadow: 'var(--shadow)', width: '100%', maxWidth: '420px',
      border: dm ? '1px solid #2d2d4e' : 'none',
      transition: 'all 0.3s ease'
    },
    header: { textAlign: 'center', marginBottom: '2rem' },
    title: { margin: '0 0 8px', color: dm ? '#fff' : '#1a1a2e', fontSize: '1.8rem', fontWeight: '800' },
    subtitle: { margin: 0, color: dm ? '#aaa' : '#888', fontSize: '0.95rem' },
    error: { 
      background: '#ffebee', color: '#c62828', padding: '12px', 
      borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', 
      fontWeight: '600', fontSize: '0.9rem', border: '1px solid #ef9a9a' 
    },
    form: { display: 'flex', flexDirection: 'column', gap: '1.4rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.85rem', color: dm ? '#aaa' : '#555', fontWeight: '700', textTransform: 'uppercase' },
    input: { 
      padding: '13px', border: '1.5px solid var(--input-border)', borderRadius: '8px', 
      fontSize: '1rem', outline: 'none', background: 'var(--input-bg)', color: 'var(--text-color)',
      transition: 'all 0.2s' 
    },
    adminToggle: { display: 'flex', alignItems: 'center', margin: '4px 0' },
    checkboxLabel: { 
      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
      fontSize: '0.95rem', color: dm ? '#ccc' : '#444', fontWeight: '600' 
    },
    checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
    adminBox: { 
      background: dm ? '#2d2d4e' : '#f3e5f5', padding: '1rem', borderRadius: '8px', 
      display: 'flex', flexDirection: 'column', gap: '8px', border: `1px solid ${dm ? '#fff' : '#ce93d8'}` 
    },
    button: { 
      color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', 
      cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '8px', 
      transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
    },
    footer: { marginTop: '2rem', textAlign: 'center', borderTop: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingTop: '1.5rem' },
    linkText: { margin: 0, fontSize: '0.95rem', color: dm ? '#aaa' : '#666' },
    link: { color: dm ? '#fff' : '#2196F3', textDecoration: 'none', fontWeight: '700' }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.header}>
          <h2 style={s.title}>Welcome Back</h2>
          <p style={s.subtitle}>Log in to manage your applications</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.inputGroup}>
            <label style={s.label}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={s.input} 
              placeholder="e.g. ali@example.com"
              required
            />
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={s.input} 
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Admin Toggle */}
          <div style={s.adminToggle}>
            <label style={s.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={() => setIsAdmin(!isAdmin)} 
                style={s.checkbox}
              />
              <span>I am an Administrator / HR</span>
            </label>
          </div>

          {/* Admin Code Field (Conditional) */}
          {isAdmin && (
            <div style={s.adminBox}>
              <label style={{ ...s.label, color: dm ? '#fff' : '#9C27B0' }}>Secret Admin Code</label>
              <input 
                type="password" 
                value={adminCode} 
                onChange={(e) => setAdminCode(e.target.value)} 
                style={{ ...s.input, borderColor: dm ? '#fff' : '#9C27B0' }} 
                placeholder="Enter secret code"
                required={isAdmin}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              ...s.button, 
              background: isAdmin ? (dm ? '#fff' : '#9C27B0') : (dm ? '#fff' : '#2196F3'),
              color: dm ? '#000' : '#fff',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : isAdmin ? '🛡️ Admin Login' : 'Login'}
          </button>
        </form>

        <div style={s.footer}>
          <p style={s.linkText}>
            Don't have an account? <Link to="/register" style={s.link}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
