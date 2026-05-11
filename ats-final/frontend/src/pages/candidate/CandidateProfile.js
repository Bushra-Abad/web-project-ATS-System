import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const CandidateProfile = () => {
  const { user, setUser } = useContext(AuthContext); 
  const { darkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    profilePicture: '',
    resume: '',
    coverLetter: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const dm = darkMode;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          profilePicture: res.data.profilePicture || '',
          resume: res.data.resume || '',
          coverLetter: res.data.coverLetter || ''
        });
      } catch (error) {
        setMessage({ text: 'Failed to load profile details.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileData = new FormData();
    const endpoint = type === 'profilePicture' ? '/upload/profile' : '/upload/resume';
    const fieldName = type === 'profilePicture' ? 'profilePic' : 'resume';
    
    fileData.append(fieldName, file);

    try {
      setMessage({ text: `Uploading ${type}... Please wait.`, type: 'info' });
      const res = await api.post(endpoint, fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, [type]: res.data.url }));
      setMessage({ text: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`, type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || `Failed to upload ${type}`, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', formData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        if (setUser) setUser(res.data);
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to update profile.',
        type: 'error'
      });
      console.error('Profile update error:', error.response?.data || error.message || error);
    } finally {
      setSaving(false);
    }
  };

  const s = {
    container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
    title: { color: dm ? '#fff' : '#1a1a2e', marginBottom: '2rem', fontSize: '2.2rem', fontWeight: '800' },
    loading: { textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: dm ? '#aaa' : '#666' },
    message: { padding: '15px', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' },
    card: { background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '10px', boxShadow: 'var(--shadow)', border: dm ? '1px solid #2d2d4e' : 'none' },
    cardTitle: { borderBottom: `2px solid ${dm ? '#2d2d4e' : '#f0f0f0'}`, paddingBottom: '10px', marginBottom: '1.5rem', color: dm ? '#fff' : '#2c3e50', fontWeight: '700' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
    label: { fontSize: '0.95rem', color: dm ? '#aaa' : '#555', fontWeight: 'bold' },
    input: { padding: '14px', border: `1px solid ${dm ? '#2d2d4e' : '#ddd'}`, borderRadius: '6px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s', background: 'var(--input-bg)', color: 'var(--text-color)' },
    saveBtn: { background: dm ? '#fff' : '#2196F3', color: dm ? '#000' : '#fff', border: 'none', padding: '15px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '10px', transition: 'background 0.3s' },
    uploadGroup: { marginBottom: '2rem', padding: '1.5rem', background: dm ? '#16213e' : '#f8f9fa', borderRadius: '8px', border: `1px dashed ${dm ? '#fff' : '#ccc'}` },
    uploadPreview: { display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' },
    fileInput: { marginTop: '10px', display: 'block', width: '100%', color: dm ? '#fff' : '#000' },
    previewImg: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${dm ? '#fff' : '#2196F3'}` },
    placeholderImg: { width: '80px', height: '80px', borderRadius: '50%', background: dm ? '#2d2d4e' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.8rem' },
    docLink: { display: 'block', margin: '10px 0', color: dm ? '#fff' : '#2196F3', textDecoration: 'none', fontWeight: 'bold', background: dm ? '#16213e' : '#e3f2fd', padding: '10px', borderRadius: '4px', textAlign: 'center', border: dm ? '1px solid #fff' : 'none' }
  };

  if (loading) return <div style={s.loading}>Loading Profile...</div>;

  return (
    <div style={s.container}>
      <h1 style={s.title}>My Profile</h1>
      
      {message.text && (
        <div style={{ ...s.message, background: message.type === 'error' ? '#ffebee' : message.type === 'info' ? '#e3f2fd' : '#e8f5e9', color: message.type === 'error' ? '#c62828' : message.type === 'info' ? '#1565c0' : '#2e7d32' }}>
          {message.text}
        </div>
      )}

      <div style={s.grid}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Personal Information</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.inputGroup}>
              <label style={s.label}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={s.input} required />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={s.input} />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} style={{ ...s.input, height: '100px', resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={saving} style={s.saveBtn}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        <div style={s.card}>
          <h3 style={s.cardTitle}>Documents & Media</h3>
          
          <div style={s.uploadGroup}>
            <label style={s.label}>Profile Picture (Image, Max 2MB)</label>
            <div style={s.uploadPreview}>
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" style={s.previewImg} />
              ) : (
                <div style={s.placeholderImg}>No Image</div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePicture')} style={s.fileInput} />
            </div>
          </div>

          <div style={s.uploadGroup}>
            <label style={s.label}>Resume (Word Document .doc/.docx, Max 5MB)</label>
            {formData.resume && (
              <a href={formData.resume} target="_blank" rel="noreferrer" style={s.docLink}>📄 Download Current Resume</a>
            )}
            <p style={{ margin: '6px 0', fontSize: '0.85rem', color: dm ? '#aaa' : '#888' }}>Only .doc and .docx files are accepted. PDFs are not supported.</p>
            <input type="file" accept=".doc,.docx" onChange={(e) => handleFileUpload(e, 'resume')} style={s.fileInput} />
          </div>
          
          <div style={s.uploadGroup}>
            <label style={s.label}>Cover Letter (Word Document .doc/.docx, Max 5MB)</label>
            {formData.coverLetter && (
              <a href={formData.coverLetter} target="_blank" rel="noreferrer" style={s.docLink}>📝 Download Current Cover Letter</a>
            )}
            <p style={{ margin: '6px 0', fontSize: '0.85rem', color: dm ? '#aaa' : '#888' }}>Only .doc and .docx files are accepted. PDFs are not supported.</p>
            <input type="file" accept=".doc,.docx" onChange={(e) => handleFileUpload(e, 'coverLetter')} style={s.fileInput} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
