import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const CandidateDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useSocket();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/applications/my');
        setApplications(res.data);
      } catch (error) {
        console.error('Error fetching applications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleApplicationSubmitted = (data) => {
        setNotification({
          message: `Your application for "${data.jobTitle}" has been submitted successfully.`,
          type: 'success'
        });

        setApplications(prev => [{
          _id: data.applicationId,
          job: { title: data.jobTitle },
          status: data.status,
          createdAt: data.createdAt
        }, ...prev]);

        setTimeout(() => setNotification(null), 5000);
      };

      const handleCandidateEmail = (data) => {
        setNotification({
          message: data.message,
          type: 'info'
        });

        setTimeout(() => setNotification(null), 6000);
      };

      socket.on('application-submitted', handleApplicationSubmitted);
      socket.on('candidate-email-notification', handleCandidateEmail);

      return () => {
        socket.off('application-submitted', handleApplicationSubmitted);
        socket.off('candidate-email-notification', handleCandidateEmail);
      };
    }
  }, [socket]);

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    interview: applications.filter(a => a.status === 'Interview Scheduled').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const recentApplications = applications.slice(0, 3);

  if (loading) return <div style={styles.loading}>Loading Dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.welcome}>Welcome back, {user?.name}!</h1>
        <p style={styles.subtitle}>Here is what's happening with your job applications.</p>
      </div>

      {notification && (
        <div style={{ ...styles.notification, background: notification.type === 'success' ? '#e8f5e9' : '#e3f2fd', color: notification.type === 'success' ? '#2e7d32' : '#1565c0' }}>
          {notification.message}
        </div>
      )}

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderTop: '4px solid #2196F3' }}>
          <h3>Total Applications</h3>
          <p style={styles.statNumber}>{stats.total}</p>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #4CAF50' }}>
          <h3>Shortlisted</h3>
          <p style={styles.statNumber}>{stats.shortlisted}</p>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #9C27B0' }}>
          <h3>Interview Scheduled</h3>
          <p style={styles.statNumber}>{stats.interview}</p>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #F44336' }}>
          <h3>Rejected</h3>
          <p style={styles.statNumber}>{stats.rejected}</p>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.recentSection}>
          <h2>Recent Applications</h2>
          {recentApplications.length > 0 ? (
            <ul style={styles.appList}>
              {recentApplications.map(app => (
                <li key={app._id} style={styles.appItem}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{app.job?.title}</h4>
                    <small style={{ color: '#666' }}>{new Date(app.createdAt).toLocaleDateString()}</small>
                  </div>
                  <span style={{ ...styles.badge, background: getStatusColor(app.status) }}>
                    {app.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666' }}>You haven't applied to any jobs yet.</p>
          )}
          <Link to="/candidate/applications" style={styles.viewAllLink}>View All Applications →</Link>
        </div>

        <div style={styles.linksSection}>
          <h2>Quick Links</h2>
          <div style={styles.quickLinksGrid}>
            <Link to="/" style={styles.quickLink}>🔍 Browse Available Jobs</Link>
            <Link to="/candidate/applications" style={styles.quickLink}>📋 My Applications</Link>
            <Link to="/candidate/profile" style={styles.quickLink}>⚙️ Edit My Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch(status) {
    case 'Submitted': return '#2196F3';
    case 'Under Review': return '#FFC107';
    case 'Shortlisted': return '#4CAF50';
    case 'Interview Scheduled': return '#9C27B0';
    case 'Selected': return '#1B5E20';
    case 'Rejected': return '#F44336';
    default: return '#757575';
  }
};

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { marginBottom: '2rem' },
  welcome: { margin: 0, fontSize: '2.2rem', color: '#1a1a2e' },
  subtitle: { color: '#666', fontSize: '1.1rem', marginTop: '10px' },
  loading: { textAlign: 'center', padding: '4rem', fontSize: '1.2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' },
  statCard: { background: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' },
  statNumber: { fontSize: '2.5rem', fontWeight: 'bold', margin: '15px 0 0 0', color: '#333' },
  contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' },
  recentSection: { background: '#fff', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  appList: { listStyle: 'none', padding: 0, margin: 0 },
  appItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 0', borderBottom: '1px solid #f0f0f0' },
  badge: { padding: '6px 12px', borderRadius: '20px', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' },
  viewAllLink: { display: 'inline-block', marginTop: '1.5rem', color: '#2196F3', textDecoration: 'none', fontWeight: 'bold', transition: 'color 0.3s' },
  linksSection: { background: '#fff', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  quickLinksGrid: { display: 'grid', gap: '1.2rem', marginTop: '1.5rem' },
  quickLink: { display: 'block', padding: '18px', background: '#f8f9fa', color: '#2c3e50', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #eee', transition: 'transform 0.2s, boxShadow 0.2s', ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' } },
  notification: { padding: '1rem 1.2rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', fontWeight: '600' }
};

export default CandidateDashboard;
