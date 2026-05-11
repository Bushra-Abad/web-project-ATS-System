import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { ThemeContext } from '../../context/ThemeContext';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetterUrl, setCoverLetterUrl] = useState('');
  const [useProfileResume, setUseProfileResume] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  const dm = darkMode;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, profileRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get('/auth/profile')
        ]);
        setJob(jobRes.data);
        setProfile(profileRes.data);
        if (profileRes.data.resume) {
          setResumeUrl(profileRes.data.resume);
        } else {
          setUseProfileResume(false);
        }
      } catch (error) {
        setMessage({ text: 'Error loading details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleFileUpload = async (e, setUrl, uploadType) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileData = new FormData();
    const fieldName = uploadType === 'coverLetter' ? 'coverLetter' : 'resume';
    const endpoint = uploadType === 'coverLetter' ? '/upload/cover-letter' : '/upload/resume';
    
    fileData.append(fieldName, file);

    try {
      setMessage({ text: `Uploading ${uploadType === 'coverLetter' ? 'cover letter' : 'resume'}...`, type: 'info' });
      const res = await api.post(endpoint, fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUrl(res.data.url);
      setMessage({ text: `${uploadType === 'coverLetter' ? 'Cover letter' : 'Resume'} uploaded successfully!`, type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || `Failed to upload ${uploadType === 'coverLetter' ? 'cover letter' : 'resume'}`, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeUrl) {
      setMessage({ text: 'Resume is required to apply.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/applications', {
        job: jobId,
        resume: resumeUrl,
        coverLetter: coverLetterUrl
      });
      setMessage({ text: 'Application submitted successfully!', type: 'success' });
      setTimeout(() => navigate('/candidate/applications'), 2000);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Failed to submit application. You may have already applied.', type: 'error' });
      setSubmitting(false);
    }
  };

  const s = {
    container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
    title: { color: dm ? '#fff' : '#1a1a2e', marginBottom: '2rem', fontSize: '2.2rem', fontWeight: '800' },
    loading: { textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: dm ? '#aaa' : '#666' },
    message: { padding: '15px', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' },
    card: { background: 'var(--card-bg)', padding: '3rem', borderRadius: '12px', boxShadow: 'var(--shadow)', border: dm ? '1px solid #2d2d4e' : 'none' },
    jobInfo: { background: dm ? '#16213e' : '#f8f9fa', padding: '1.5rem 2rem', borderRadius: '8px', marginBottom: '2.5rem', borderLeft: `5px solid ${dm ? '#4ecca3' : '#2196F3'}`, border: dm ? '1px solid #2d2d4e' : 'none', borderLeftWidth: '5px' },
    form: { display: 'flex', flexDirection: 'column', gap: '2.5rem' },
    section: { borderBottom: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingBottom: '2rem' },
    sectionTitle: { color: dm ? '#fff' : '#2c3e50', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: '700' },
    radioGroup: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' },
    radioLabel: { fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: dm ? '#eee' : '#333' },
    uploadBox: { background: dm ? '#16213e' : '#fafafa', padding: '2rem', borderRadius: '8px', border: `2px dashed ${dm ? '#4ecca3' : '#ccc'}`, textAlign: 'center' },
    helpText: { margin: '0 0 15px 0', color: dm ? '#aaa' : '#666', fontSize: '1rem' },
    successText: { color: dm ? '#fff' : '#2e7d32', fontWeight: 'bold', margin: '15px 0 0 0', fontSize: '1.1rem' },
    submitBtn: { background: dm ? '#fff' : '#4CAF50', color: dm ? '#000' : '#fff', border: 'none', padding: '18px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1rem', transition: 'background 0.3s' }
  };

  if (loading) return <div style={s.loading}>Preparing application...</div>;
  if (!job) return <div style={s.loading}>Job not found.</div>;

  return (
    <div style={s.container}>
      <h1 style={s.title}>Complete Your Application</h1>
      
      {message.text && (
        <div style={{ ...s.message, background: message.type === 'error' ? '#ffebee' : message.type === 'success' ? '#e8f5e9' : '#e3f2fd', color: message.type === 'error' ? '#c62828' : message.type === 'success' ? '#2e7d32' : '#1565c0' }}>
          {message.text}
        </div>
      )}

      <div style={s.card}>
        <div style={s.jobInfo}>
          <h2 style={{ margin: '0 0 10px 0', color: dm ? '#fff' : '#1a1a2e' }}>{job.title}</h2>
          <p style={{ margin: 0, color: dm ? '#aaa' : '#555', fontSize: '1.1rem' }}>🏢 {job.department} | 📍 {job.branch?.name}</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.section}>
            <h3 style={s.sectionTitle}>1. Resume (Required)</h3>
            {profile?.resume && (
              <div style={s.radioGroup}>
                <label style={s.radioLabel}>
                  <input 
                    type="radio" 
                    checked={useProfileResume} 
                    onChange={() => { setUseProfileResume(true); setResumeUrl(profile.resume); }} 
                    style={{ marginRight: '10px' }}
                  /> 
                  Use the resume saved in my profile
                </label>
                <label style={s.radioLabel}>
                  <input 
                    type="radio" 
                    checked={!useProfileResume} 
                    onChange={() => { setUseProfileResume(false); setResumeUrl(''); }} 
                    style={{ marginRight: '10px' }}
                  /> 
                  Upload a different resume for this job
                </label>
              </div>
            )}
            
            {(!useProfileResume || !profile?.resume) && (
              <div style={s.uploadBox}>
                <p style={s.helpText}>📄 Upload your resume in <strong>Word Document format (.doc or .docx)</strong> only (Max 5MB). PDFs are not supported.</p>
                <input type="file" accept=".doc,.docx" onChange={(e) => handleFileUpload(e, setResumeUrl, 'resume')} required={!resumeUrl} style={{ padding: '10px', color: dm ? '#fff' : '#000' }} />
                {resumeUrl && <p style={s.successText}>✓ Resume is ready to be submitted</p>}
              </div>
            )}
          </div>

          <div style={s.section}>
            <h3 style={s.sectionTitle}>2. Cover Letter (Optional)</h3>
            <div style={s.uploadBox}>
              <p style={s.helpText}>📝 Upload your cover letter in <strong>Word Document format (.doc or .docx)</strong> only (Max 3MB). This helps HR understand why you're perfect for this role.</p>
              <input type="file" accept=".doc,.docx" onChange={(e) => handleFileUpload(e, setCoverLetterUrl, 'coverLetter')} style={{ padding: '10px', color: dm ? '#fff' : '#000' }} />
              {coverLetterUrl && <p style={s.successText}>✓ Cover Letter is ready to be submitted</p>}
            </div>
          </div>

          <button type="submit" disabled={submitting || !resumeUrl} style={{ ...s.submitBtn, opacity: (submitting || !resumeUrl) ? 0.6 : 1 }}>
            {submitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyJob;
