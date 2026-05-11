import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { ThemeContext } from '../../context/ThemeContext';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const { socket } = useSocket();
  const { darkMode } = useContext(ThemeContext);

  const dm = darkMode;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications/my');
        setApplications(res.data);
      } catch (error) {
        console.error('Error fetching applications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();

    if (socket) {
      const handleStatusUpdate = (data) => {
        setApplications(prevApps => 
          prevApps.map(app => 
            app._id === data.applicationId 
              ? { ...app, status: data.newStatus }
              : app
          )
        );
        setNotification({
          type: 'success',
          message: `Your application for "${data.jobTitle}" has been updated to "${data.newStatus}"`
        });
        setTimeout(() => setNotification(null), 5000);
      };

      const handleApplicationSubmitted = (data) => {
        setApplications(prevApps => [
          {
            _id: data.applicationId,
            job: { title: data.jobTitle },
            status: data.status,
            createdAt: data.createdAt
          },
          ...prevApps
        ]);
        setNotification({
          type: 'success',
          message: `Your application for "${data.jobTitle}" has been submitted successfully.`
        });
        setTimeout(() => setNotification(null), 5000);
      };

      const handleEmailNotification = (data) => {
        setNotification({
          type: 'info',
          message: data.message
        });
        setTimeout(() => setNotification(null), 5000);
      };

      socket.on('application-status-update', handleStatusUpdate);
      socket.on('application-submitted', handleApplicationSubmitted);
      socket.on('candidate-email-notification', handleEmailNotification);

      return () => {
        socket.off('application-status-update', handleStatusUpdate);
        socket.off('application-submitted', handleApplicationSubmitted);
        socket.off('candidate-email-notification', handleEmailNotification);
      };
    }
  }, [socket]);

  const s = {
    container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
    title: { color: dm ? '#fff' : '#1a1a2e', marginBottom: '2rem', fontSize: '2.2rem', fontWeight: '800' },
    loading: { textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: dm ? '#aaa' : '#666' },
    notification: { 
      background: '#4CAF50', 
      color: '#fff', 
      padding: '1rem', 
      borderRadius: '6px', 
      marginBottom: '1rem', 
      textAlign: 'center',
      fontWeight: 'bold'
    },
    grid: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    card: { background: 'var(--card-bg)', borderRadius: '10px', boxShadow: 'var(--shadow)', overflow: 'hidden', border: dm ? '1px solid #2d2d4e' : 'none' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem 2rem', background: dm ? '#16213e' : '#f8f9fa', borderBottom: `1px solid ${dm ? '#2d2d4e' : '#eee'}` },
    jobTitle: { margin: '0 0 8px 0', fontSize: '1.5rem', color: dm ? '#fff' : '#2c3e50', fontWeight: '700' },
    companyInfo: { margin: 0, color: dm ? '#aaa' : '#666', fontSize: '0.95rem' },
    badge: { padding: '8px 16px', borderRadius: '25px', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    cardBody: { padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
    date: { margin: 0, color: dm ? '#eee' : '#444', fontSize: '1.05rem' },
    docLinks: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    link: { 
      color: dm ? '#fff' : '#1a1a2e', 
      textDecoration: 'none', 
      fontWeight: 'bold', 
      display: 'flex', 
      alignItems: 'center', 
      background: dm ? '#2d2d4e' : '#f0f0f0', 
      padding: '8px 15px', 
      borderRadius: '6px', 
      transition: 'background 0.3s',
      border: dm ? '1px solid #fff' : 'none',
      cursor: 'pointer',
      fontSize: '0.95rem'
    },
    cardFooter: { padding: '1.2rem 2rem', background: dm ? '#16213e' : '#fafafa', borderTop: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' },
    btn: { background: dm ? '#fff' : '#1a1a2e', color: dm ? '#000' : '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', transition: 'background 0.3s' },
    interviewBtn: { background: '#9C27B0', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' },
    emptyState: { textAlign: 'center', padding: '5rem 2rem', background: 'var(--card-bg)', borderRadius: '10px', boxShadow: 'var(--shadow)', border: dm ? '1px solid #2d2d4e' : 'none' },
    browseBtn: { display: 'inline-block', background: '#2196F3', color: '#fff', padding: '12px 25px', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem' },
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

  if (loading) return <div style={s.loading}>Loading Applications...</div>;

  return (
    <div style={s.container}>
      {notification && (
        <div style={s.notification}>
          {notification.message}
        </div>
      )}
      <h1 style={s.title}>My Applications</h1>
      
      <div style={s.grid}>
        {applications.length > 0 ? (
          applications.map(app => (
            <div key={app._id} style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <h3 style={s.jobTitle}>{app.job?.title || 'Job Unavailable'}</h3>
                  <p style={s.companyInfo}>🏢 {app.job?.department} | 📍 {app.job?.branch?.name || 'Remote'}</p>
                </div>
                <span style={{ ...s.badge, background: getStatusColor(app.status) }}>
                  {app.status}
                </span>
              </div>
              
              <div style={s.cardBody}>
                <p style={s.date}><strong>Applied On:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                <div style={s.docLinks}>
                  {app.resume && (
                    <a
                      href={app.resume}
                      download
                      target="_blank"
                      rel="noreferrer"
                      style={s.link}
                    >
                      ⬇️ Download Resume
                    </a>
                  )}
                  {app.coverLetter && (
                    <a
                      href={app.coverLetter}
                      download
                      target="_blank"
                      rel="noreferrer"
                      style={s.link}
                    >
                      ⬇️ Download Cover Letter
                    </a>
                  )}
                </div>
              </div>
              <div style={s.cardFooter}>
                <Link to={`/jobs/${app.job?._id}`} style={s.btn}>View Job Details</Link>
                {app.status === 'Interview Scheduled' && (
                  <button
                    onClick={() => navigate('/candidate/interview')}
                    style={s.interviewBtn}
                  >
                    🗓️ View Interview Details
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={s.emptyState}>
            <h3 style={{ color: dm ? '#fff' : '#555' }}>No applications found</h3>
            <p style={{ color: dm ? '#aaa' : '#777', marginBottom: '2rem' }}>You haven't applied to any jobs yet. Start exploring our open positions!</p>
            <Link to="/" style={s.browseBtn}>Browse Jobs</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
