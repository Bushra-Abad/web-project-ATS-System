import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav} className="navbar">
      <div style={styles.brand}>
        <Link to="/" style={styles.link}>Modern ATS</Link>
      </div>
      
      <div style={styles.linksContainer}>
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode} 
          style={{...styles.themeToggle, background: darkMode ? '#f39c12' : '#2c3e50'}}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <Link to="/" style={styles.link}>Jobs</Link>
        
        {!user && (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}

        {user && user.role === 'candidate' && (
          <>
            <Link to="/candidate/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/candidate/applications" style={styles.link}>My Applications</Link>
            <Link to="/candidate/profile" style={styles.link}>Profile</Link>
          </>
        )}

        {user && (user.role === 'hr' || user.role === 'admin') && (
          <>
            <Link to="/hr/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/hr/jobs" style={styles.link}>Manage Jobs</Link>
            <Link to="/hr/applicants" style={styles.link}>Applicants</Link>
            <Link to="/hr/interviews" style={styles.link}>Interviews</Link>
            {user.role === 'admin' && (
              <Link to="/hr/branches" style={{ ...styles.link, color: '#FFC107' }}>🏢 Branches</Link>
            )}
          </>
        )}

        {user && (
          <div style={styles.userInfo}>
            <span style={styles.userName}>Welcome, {user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'var(--nav-bg)',
    color: 'var(--nav-text)',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  linksContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  link: {
    color: 'var(--nav-text)',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'color 0.3s'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginLeft: '20px',
    borderLeft: '1px solid #444',
    paddingLeft: '20px'
  },
  userName: {
    fontSize: '0.9rem',
    color: '#ccc'
  },
  logoutBtn: {
    background: '#e94560',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  themeToggle: {
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: 'all 0.3s',
    marginRight: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  }
};

export default Navbar;
