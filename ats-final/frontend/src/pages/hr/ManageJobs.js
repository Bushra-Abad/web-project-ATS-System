import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', department: '', branch: '', seats: 1, requirements: '', status: 'active'
  });

  useEffect(() => {
    fetchJobsAndBranches();
  }, []);

  const fetchJobsAndBranches = async () => {
    try {
      const [jobsRes, branchRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/branches')
      ]);
      setJobs(jobsRes.data);
      setBranches(branchRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ title: '', description: '', department: '', branch: '', seats: 1, requirements: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setIsEditing(true);
    setCurrentJobId(job._id);
    setFormData({
      title: job.title,
      description: job.description,
      department: job.department,
      branch: job.branch?._id || '',
      seats: job.seats,
      requirements: job.requirements ? job.requirements.join('\n') : '',
      status: job.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) {
      try {
        await api.delete(`/jobs/${id}`);
        setJobs(jobs.filter(j => j._id !== id));
      } catch (error) {
        alert('Failed to delete job');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reqArray = formData.requirements.split('\n').filter(r => r.trim() !== '');
    const payload = { ...formData, requirements: reqArray };

    try {
      if (isEditing) {
        const res = await api.put(`/jobs/${currentJobId}`, payload);
        const updatedJobs = jobs.map(j => j._id === currentJobId ? res.data : j);
        // Force refresh to get populated branch details properly
        fetchJobsAndBranches(); 
      } else {
        await api.post('/jobs', payload);
        fetchJobsAndBranches();
      }
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving job');
    }
  };

  if (loading) return <div style={styles.loading}>Loading Jobs Data...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Job Postings</h1>
        <button onClick={openAddModal} style={styles.addBtn}>+ Add New Job</button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Job Title</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Branch</th>
              <th style={styles.th}>Seats</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? jobs.map(job => (
              <tr key={job._id} style={styles.tr}>
                <td style={styles.td}><strong>{job.title}</strong></td>
                <td style={styles.td}>{job.department}</td>
                <td style={styles.td}>📍 {job.branch?.name || 'N/A'}</td>
                <td style={styles.td}>{job.seats}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: job.status === 'active' ? '#4CAF50' : '#F44336' }}>
                    {job.status.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => openEditModal(job)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(job._id)} style={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={styles.emptyText}>No job postings found. Click "+ Add New Job" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: '#1a1a2e' }}>{isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Job Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} style={styles.input} required placeholder="e.g. Senior Software Engineer" />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} style={styles.input} placeholder="e.g. Engineering" />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Branch Location *</label>
                  <select name="branch" value={formData.branch} onChange={handleInputChange} style={styles.select} required>
                    <option value="">-- Select a Branch --</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name} - {b.address}</option>)}
                  </select>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Available Seats</label>
                  <input type="number" name="seats" value={formData.seats} onChange={handleInputChange} style={styles.input} min="1" />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Job Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...styles.input, height: '120px', resize: 'vertical' }} required placeholder="Detailed job description..." />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Requirements (One per line)</label>
                <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} style={{ ...styles.input, height: '120px', resize: 'vertical' }} placeholder="Minimum 3 years of experience&#10;Proficient in React and Node.js&#10;Strong communication skills" />
              </div>

              {isEditing && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Job Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} style={styles.select}>
                    <option value="active">Active (Visible to candidates)</option>
                    <option value="closed">Closed (Hidden from candidates)</option>
                  </select>
                </div>
              )}

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>{isEditing ? 'Update Job' : 'Publish Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #eee' },
  title: { margin: 0, color: '#1a1a2e', fontSize: '2.2rem' },
  addBtn: { background: '#2196F3', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05rem', transition: 'background 0.3s', boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)' },
  loading: { textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: '#666' },
  tableContainer: { background: '#fff', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { background: '#f8f9fa', borderBottom: '2px solid #eee' },
  th: { padding: '18px 20px', color: '#444', fontWeight: 'bold', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '15px 20px', color: '#333', fontSize: '0.95rem' },
  badge: { padding: '6px 12px', borderRadius: '20px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' },
  editBtn: { background: '#fff', color: '#FFC107', border: '1px solid #FFC107', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold', transition: 'all 0.3s' },
  deleteBtn: { background: '#fff', color: '#F44336', border: '1px solid #F44336', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' },
  emptyText: { textAlign: 'center', padding: '3rem', color: '#777', fontSize: '1.1rem' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' },
  closeBtn: { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#aaa', lineHeight: 1 },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { fontSize: '0.95rem', color: '#555', fontWeight: 'bold' },
  input: { padding: '14px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', outline: 'none' },
  select: { padding: '14px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', outline: 'none', background: '#fff' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' },
  cancelBtn: { background: '#fff', color: '#555', border: '1px solid #ccc', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  submitBtn: { background: '#2196F3', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)' }
};

export default ManageJobs;
