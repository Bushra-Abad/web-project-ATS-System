import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const ROLE_OPTIONS = [
  {
    value: 'candidate',
    label: '👤 Candidate',
    description: 'Looking for job opportunities',
    color: '#2196F3',
    bg: '#e3f2fd',
    darkBg: '#0d47a1',
  },
  {
    value: 'hr',
    label: '🧑‍💼 HR Manager',
    description: 'Posting jobs & reviewing applicants',
    color: '#4CAF50',
    bg: '#e8f5e9',
    darkBg: '#1b5e20',
  },
  {
    value: 'admin',
    label: '🛡️ System Admin',
    description: 'Full system access (requires admin code)',
    color: '#9C27B0',
    bg: '#f3e5f5',
    darkBg: '#4a148c',
  },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'candidate', adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const dm = darkMode;

  // The admin secret is checked on the frontend to show/hide the field,
  // and validated on the backend for security.
  const ADMIN_SECRET = 'ATS@Admin2026';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const selectRole = (role) => {
    setFormData({ ...formData, role, adminCode: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.role === 'admin') {
      if (!formData.adminCode) {
        setError('Admin registration requires the secret admin code.');
        return;
      }
      if (formData.adminCode !== ADMIN_SECRET) {
        setError('❌ Invalid admin code. Contact the system administrator.');
        return;
      }
    }

    setLoading(true);
    const payload = {
      name: formData.name,
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      adminCode: formData.adminCode,
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      navigate('/login');
    } else {
      setError(res.message);
    }
  };

  const selectedRole = ROLE_OPTIONS.find(r => r.value === formData.role);

  const s = {
    container: {
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '85vh', padding: '2rem 1rem', background: 'var(--bg-color)',
      transition: 'all 0.3s ease'
    },
    card: {
      background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '14px',
      boxShadow: 'var(--shadow)', width: '100%', maxWidth: '540px',
      border: dm ? '1px solid #2d2d4e' : 'none',
      transition: 'all 0.3s ease'
    },
    header: { textAlign: 'center', marginBottom: '2rem' },
    title: { margin: '0 0 6px', color: dm ? '#fff' : '#1a1a2e', fontSize: '1.9rem', fontWeight: '800' },
    subtitle: { margin: 0, color: dm ? '#aaa' : '#888', fontSize: '1rem' },
    error: {
      background: '#ffebee', color: '#c62828', padding: '12px 16px',
      borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center',
      fontWeight: '600', fontSize: '0.95rem', border: '1px solid #ef9a9a'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '1.3rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.88rem', color: dm ? '#aaa' : '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px' },
    input: {
      padding: '12px 14px', border: '1.5px solid var(--input-border)', borderRadius: '8px',
      fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
      fontFamily: 'inherit', background: 'var(--input-bg)', color: 'var(--text-color)'
    },
    row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
    roleCard: (opt) => ({
      position: 'relative', padding: '12px 10px', borderRadius: '10px',
      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
      display: 'flex', flexDirection: 'column', gap: '4px', userSelect: 'none',
      border: formData.role === opt.value
        ? `2px solid ${opt.color}`
        : `2px solid ${dm ? '#2d2d4e' : '#e0e0e0'}`,
      background: formData.role === opt.value 
        ? (dm ? opt.darkBg : opt.bg) 
        : (dm ? '#16213e' : '#fff'),
    }),
    roleLabel: { fontSize: '0.9rem', fontWeight: '700', color: dm ? '#fff' : '#1a1a2e' },
    roleDesc: (opt) => ({ 
        fontSize: '0.72rem', lineHeight: '1.3',
        color: formData.role === opt.value ? (dm ? '#fff' : opt.color) : (dm ? '#888' : '#999'),
    }),
    selectedDot: {
      position: 'absolute', top: '6px', right: '8px', color: '#fff',
      borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900'
    },
    adminBox: {
      background: dm ? '#2d2d4e' : '#f3e5f5', border: `1.5px solid ${dm ? '#9C27B0' : '#ce93d8'}`, borderRadius: '10px',
      padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem'
    },
    adminNote: { margin: 0, fontSize: '0.88rem', color: dm ? '#ce93d8' : '#6a1b9a', lineHeight: '1.5' },
    button: {
      color: dm ? '#000' : '#fff', border: 'none', padding: '15px', borderRadius: '8px',
      cursor: 'pointer', fontSize: '1.05rem', fontWeight: '800', marginTop: '6px',
      transition: 'opacity 0.2s', letterSpacing: '0.3px'
    },
    linkText: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: dm ? '#aaa' : '#666' },
    link: { color: dm ? '#fff' : '#2196F3', textDecoration: 'none', fontWeight: '700' },
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <h2 style={s.title}>Create Account</h2>
          <p style={s.subtitle}>Join the Modern ATS platform</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>

          {/* Role Selector — card style */}
          <div style={s.inputGroup}>
            <label style={s.label}>Register As *</label>
            <div style={s.roleGrid}>
              {ROLE_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => selectRole(opt.value)}
                  style={s.roleCard(opt)}
                >
                  <span style={s.roleLabel}>{opt.label}</span>
                  <span style={s.roleDesc(opt)}>
                    {opt.description}
                  </span>
                  {formData.role === opt.value && (
                    <span style={{ ...s.selectedDot, background: opt.color }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div style={s.inputGroup}>
            <label style={s.label}>Full Name *</label>
            <input
              type="text" name="name" value={formData.name}
              onChange={handleChange} style={s.input}
              placeholder="e.g. xyz" required
            />
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Email Address *</label>
            <input
              type="email" name="email" value={formData.email}
              onChange={handleChange} style={s.input}
              placeholder="xyz@example.com" required
            />
          </div>

          <div style={s.row}>
            <div style={{ ...s.inputGroup, flex: 1 }}>
              <label style={s.label}>Password *</label>
              <input
                type="password" name="password" value={formData.password}
                onChange={handleChange} style={s.input}
                placeholder="Min. 6 characters" required
              />
            </div>
            <div style={{ ...s.inputGroup, flex: 1 }}>
              <label style={s.label}>Phone Number *</label>
              <input
                type="text" name="phone" value={formData.phone}
                onChange={handleChange} style={s.input}
                placeholder="0300-1234567" required
              />
            </div>
          </div>

          {/* Admin Code — only shown when admin is selected */}
          {formData.role === 'admin' && (
            <div style={s.adminBox}>
              <p style={s.adminNote}>
                🛡️ <strong>Admin Registration</strong> — Enter the secret admin code provided by your system administrator.
              </p>
              <div style={s.inputGroup}>
                <label style={s.label}>Admin Secret Code *</label>
                <input
                  type="password" name="adminCode" value={formData.adminCode}
                  onChange={handleChange}
                  style={{ ...s.input, borderColor: dm ? '#fff' : '#9C27B0' }}
                  placeholder="Enter admin secret code"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.button,
              background: dm ? '#fff' : (selectedRole?.color || '#4CAF50'),
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? 'Creating Account...'
              : `Register as ${selectedRole?.label || 'Candidate'}`}
          </button>
        </form>

        <p style={s.linkText}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
