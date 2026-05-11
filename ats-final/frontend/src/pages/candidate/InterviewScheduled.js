import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const InterviewScheduled = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/interviews/my');
        setInterviews(res.data);
      } catch (err) {
        setError('Could not load your interview details. Please try again later.');
        console.error('Error fetching interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your interview details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <p>{error}</p>
          <button onClick={() => navigate('/candidate/applications')} style={styles.backBtn}>
            ← Back to Applications
          </button>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <span style={{ fontSize: '4rem' }}>📅</span>
          <h2 style={{ color: '#1a1a2e', marginTop: '1rem' }}>No Interviews Scheduled Yet</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            You don't have any interviews scheduled at this time. Keep an eye on your application status!
          </p>
          <button onClick={() => navigate('/candidate/applications')} style={styles.backBtn}>
            ← Back to My Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/candidate/applications')} style={styles.backLink}>
          ← Back to Applications
        </button>
        <h1 style={styles.title}>🗓️ Your Scheduled Interviews</h1>
        <p style={styles.subtitle}>Here are your upcoming interview details. Be prepared and good luck!</p>
      </div>

      <div style={styles.grid}>
        {interviews.map((interview) => (
          <div key={interview._id} style={styles.card}>
            {/* Card Header */}
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.jobTitle}>{interview.job?.title || 'Job Title N/A'}</h2>
                <p style={styles.department}>🏢 {interview.job?.department || 'Department N/A'}</p>
              </div>
              <span style={styles.badge}>Interview Scheduled</span>
            </div>

            {/* Interview Details */}
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailIcon}>📅</span>
                <div>
                  <p style={styles.detailLabel}>Date</p>
                  <p style={styles.detailValue}>
                    {interview.date
                      ? new Date(interview.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'To be confirmed'}
                  </p>
                </div>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailIcon}>⏰</span>
                <div>
                  <p style={styles.detailLabel}>Time</p>
                  <p style={styles.detailValue}>{interview.time || 'To be confirmed'}</p>
                </div>
              </div>

              {interview.message && (
                <div style={{ ...styles.detailItem, gridColumn: '1 / -1' }}>
                  <span style={styles.detailIcon}>💬</span>
                  <div>
                    <p style={styles.detailLabel}>Message from HR</p>
                    <p style={{ ...styles.detailValue, fontStyle: 'italic', color: '#555', whiteSpace: 'pre-wrap' }}>
                      "{interview.message}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tips Section */}
            <div style={styles.tipsBox}>
              <h4 style={styles.tipsTitle}>💡 Preparation Tips</h4>
              <ul style={styles.tipsList}>
                <li>Research the company and the role thoroughly</li>
                <li>Prepare answers for common interview questions</li>
                <li>Have a copy of your resume ready</li>
                <li>Arrive or join the call 5 minutes early</li>
                <li>Dress professionally and be confident!</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e0e0e0',
    borderTop: '5px solid #9C27B0',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: { color: '#666', fontSize: '1.1rem' },
  errorBox: {
    textAlign: 'center',
    padding: '3rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    color: '#c62828',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: { marginBottom: '2.5rem' },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#9C27B0',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    padding: '0',
    marginBottom: '1rem',
    display: 'inline-block',
  },
  title: { fontSize: '2.2rem', color: '#1a1a2e', margin: '0 0 0.5rem 0' },
  subtitle: { color: '#666', fontSize: '1.05rem', margin: 0 },
  grid: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  card: {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 6px 25px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    border: '1px solid #f0e6ff',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem 2rem',
    background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
    color: '#fff',
  },
  jobTitle: { margin: '0 0 6px 0', fontSize: '1.5rem', color: '#fff' },
  department: { margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '1rem' },
  badge: {
    background: 'rgba(255,255,255,0.25)',
    color: '#fff',
    padding: '6px 16px',
    borderRadius: '25px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    border: '1px solid rgba(255,255,255,0.4)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    padding: '2rem',
    borderBottom: '1px solid #f5f5f5',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  detailIcon: { fontSize: '1.5rem', marginTop: '2px' },
  detailLabel: { margin: '0 0 4px 0', fontSize: '0.85rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { margin: 0, fontSize: '1.05rem', color: '#1a1a2e', fontWeight: 'bold' },
  tipsBox: {
    background: '#f9f0ff',
    padding: '1.5rem 2rem',
    borderTop: '1px solid #e8d5ff',
  },
  tipsTitle: { margin: '0 0 0.8rem 0', color: '#7B1FA2', fontSize: '1rem' },
  tipsList: {
    margin: 0,
    paddingLeft: '1.2rem',
    color: '#555',
    lineHeight: '1.8',
    fontSize: '0.95rem',
  },
  backBtn: {
    background: '#9C27B0',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '1rem',
  },
};

export default InterviewScheduled;
