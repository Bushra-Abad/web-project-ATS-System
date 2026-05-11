import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const dm = darkMode;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (error) {
        console.error('Error fetching job details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'candidate') {
      alert('Only candidate accounts can apply for jobs.');
      return;
    }

    navigate(`/candidate/apply/${id}`);
  };

  const s = {
    container: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
    card: { background: 'var(--card-bg)', padding: '3rem', borderRadius: '12px', boxShadow: 'var(--shadow)', border: dm ? '1px solid #2d2d4e' : 'none' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${dm ? '#2d2d4e' : '#f0f0f0'}`, paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    title: { margin: '0 0 10px 0', color: dm ? '#fff' : '#1a1a2e', fontSize: '2.2rem', fontWeight: '800' },
    subtitle: { display: 'flex', gap: '15px' },
    tag: { color: dm ? '#aaa' : '#666', fontSize: '1rem', background: dm ? '#16213e' : '#f5f5f5', padding: '4px 10px', borderRadius: '4px', border: dm ? '1px solid #2d2d4e' : 'none' },
    applyBtn: { background: '#e94560', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', transition: 'background 0.3s', boxShadow: '0 4px 10px rgba(233, 69, 96, 0.3)' },
    metaBox: { display: 'flex', gap: '2rem', background: dm ? '#16213e' : '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2.5rem', flexWrap: 'wrap', border: dm ? '1px solid #2d2d4e' : 'none' },
    metaItem: { display: 'flex', flexDirection: 'column', gap: '5px' },
    metaLabel: { fontSize: '0.85rem', color: dm ? '#aaa' : '#777', textTransform: 'uppercase', letterSpacing: '1px' },
    metaValue: { fontSize: '1.1rem', fontWeight: 'bold', color: dm ? '#fff' : '#333' },
    contentSection: { marginBottom: '2.5rem' },
    sectionTitle: { color: dm ? '#fff' : '#1a1a2e', borderBottom: '2px solid #e94560', display: 'inline-block', paddingBottom: '8px', marginBottom: '1rem', fontWeight: '700' },
    text: { lineHeight: '1.8', color: dm ? '#eee' : '#444', fontSize: '1.05rem', whiteSpace: 'pre-line' },
    list: { paddingLeft: '20px', color: dm ? '#eee' : '#444', fontSize: '1.05rem', lineHeight: '1.8' },
    listItem: { marginBottom: '0.8rem' }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: dm ? '#fff' : '#000' }}>Loading job details...</div>;
  if (!job) return <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: 'red' }}>Job not found.</div>;

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>{job.title}</h1>
            <div style={s.subtitle}>
              <span style={s.tag}>📍 {job.branch?.name}</span>
              <span style={s.tag}>🏢 {job.department}</span>
            </div>
          </div>
          <button onClick={handleApply} style={s.applyBtn}>Apply Now</button>
        </div>
        
        <div style={s.metaBox}>
          <div style={s.metaItem}>
            <span style={s.metaLabel}>Status</span>
            <span style={{ ...s.metaValue, color: job.status === 'active' ? '#4ecca3' : '#e94560' }}>
              {job.status.toUpperCase()}
            </span>
          </div>
          <div style={s.metaItem}>
            <span style={s.metaLabel}>Available Seats</span>
            <span style={s.metaValue}>{job.seats}</span>
          </div>
          <div style={s.metaItem}>
            <span style={s.metaLabel}>Posted On</span>
            <span style={s.metaValue}>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={s.contentSection}>
          <h3 style={s.sectionTitle}>Job Description</h3>
          <p style={s.text}>{job.description}</p>
        </div>

        <div style={s.contentSection}>
          <h3 style={s.sectionTitle}>Requirements & Qualifications</h3>
          <ul style={s.list}>
            {job.requirements && job.requirements.length > 0 ? (
              job.requirements.map((req, index) => (
                <li key={index} style={s.listItem}>{req}</li>
              ))
            ) : (
              <p>No specific requirements listed.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
