import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/axios';
import { ThemeContext } from '../../context/ThemeContext';

const BRANCH_ICONS = {
  'Islamabad': '🏛️',
  'Lahore':    '🌆',
  'Karachi':   '🌊',
  'Remote':    '🌐',
};

const ManageBranches = () => {
  const [branches, setBranches]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [currentId, setCurrentId]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);
  const { darkMode }                = useContext(ThemeContext);

  const dm = darkMode;

  const [formData, setFormData] = useState({ name: '', address: '', contact: '' });

  useEffect(() => { fetchBranches(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch {
      showToast('Failed to load branches.', 'error');
    } finally { setLoading(false); }
  };

  const openAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', address: '', contact: '' });
    setShowModal(true);
  };

  const openEdit = (branch) => {
    setIsEditing(true);
    setCurrentId(branch._id);
    setFormData({ name: branch.name, address: branch.address || '', contact: branch.contact || '' });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete branch "${name}"? Jobs assigned to this branch may be affected.`)) return;
    try {
      await api.delete(`/branches/${id}`);
      setBranches(prev => prev.filter(b => b._id !== id));
      showToast(`Branch "${name}" deleted.`);
    } catch {
      showToast('Failed to delete branch.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        const res = await api.put(`/branches/${currentId}`, formData);
        setBranches(prev => prev.map(b => b._id === currentId ? res.data : b));
        showToast('Branch updated successfully!');
      } else {
        const res = await api.post('/branches', formData);
        setBranches(prev => [...prev, res.data]);
        showToast('Branch created successfully!');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving branch.', 'error');
    } finally { setSubmitting(false); }
  };

  const s = {
    container:   { padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' },
    loading:     { textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: dm ? '#aaa' : '#666' },
    toast:       { position: 'fixed', top: '20px', right: '20px', color: '#fff', padding: '14px 22px', borderRadius: '8px', fontWeight: '700', zIndex: 9999, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    title:       { margin: '0 0 6px', fontSize: '2rem', color: dm ? '#fff' : '#1a1a2e', fontWeight: '800' },
    subtitle:    { margin: 0, color: dm ? '#aaa' : '#777', fontSize: '0.95rem' },
    addBtn:      { background: dm ? '#fff' : '#2196F3', color: dm ? '#000' : '#fff', border: 'none', padding: '13px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' },
    statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
    statBox:     { background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', textAlign: 'center', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '4px', border: dm ? '1px solid #2d2d4e' : 'none' },
    statNum:     { fontSize: '2.5rem', fontWeight: '800', color: dm ? '#fff' : '#1a1a2e' },
    statLabel:   { fontSize: '0.85rem', color: dm ? '#aaa' : '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
    grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
    card:        { background: 'var(--card-bg)', borderRadius: '12px', padding: '1.8rem', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '1rem', border: dm ? '1px solid #2d2d4e' : '1px solid #f0f0f0' },
    cardTop:     { display: 'flex', alignItems: 'flex-start', gap: '1rem' },
    icon:        { fontSize: '2.5rem', flexShrink: 0 },
    cardTitles:  { flex: 1 },
    branchName:  { margin: '0 0 4px', fontSize: '1.4rem', color: dm ? '#fff' : '#1a1a2e', fontWeight: '800' },
    branchAddress:{ margin: 0, color: dm ? '#aaa' : '#666', fontSize: '0.9rem' },
    contact:     { margin: 0, color: dm ? '#eee' : '#555', fontSize: '0.9rem', background: dm ? '#16213e' : '#f8f9fa', padding: '8px 12px', borderRadius: '6px', border: dm ? '1px solid #2d2d4e' : 'none' },
    cardFooter:  { display: 'flex', gap: '10px', marginTop: 'auto' },
    editBtn:     { flex: 1, background: dm ? '#16213e' : '#fff8e1', color: dm ? '#ffb74d' : '#e65100', border: `1px solid ${dm ? '#ffb74d' : '#ffcc80'}`, padding: '9px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' },
    deleteBtn:   { flex: 1, background: dm ? '#16213e' : '#ffebee', color: dm ? '#e57373' : '#c62828', border: `1px solid ${dm ? '#e57373' : '#ef9a9a'}`, padding: '9px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' },
    empty:       { textAlign: 'center', padding: '5rem', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow)', border: dm ? '1px solid #2d2d4e' : 'none' },
    overlay:     { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modal:       { background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow)', maxHeight: '90vh', overflowY: 'auto', border: dm ? '1px solid #2d2d4e' : 'none' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingBottom: '1rem' },
    closeBtn:    { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#aaa', lineHeight: 1 },
    form:        { display: 'flex', flexDirection: 'column', gap: '1.4rem' },
    inputGroup:  { display: 'flex', flexDirection: 'column', gap: '7px' },
    label:       { fontSize: '0.9rem', color: dm ? '#aaa' : '#555', fontWeight: '700' },
    input:       { padding: '13px', border: `1px solid ${dm ? '#2d2d4e' : '#ddd'}`, borderRadius: '6px', fontSize: '0.95rem', outline: 'none', background: 'var(--input-bg)', color: 'var(--text-color)' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem', borderTop: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingTop: '1.4rem' },
    cancelBtn:   { background: dm ? '#2d2d4e' : '#f5f5f5', border: `1px solid ${dm ? '#444' : '#ccc'}`, color: dm ? '#eee' : '#555', padding: '11px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' },
    submitBtn:   { background: dm ? '#fff' : '#2196F3', color: dm ? '#000' : '#fff', border: 'none', padding: '11px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  };

  if (loading) return <div style={s.loading}>Loading Branch Data...</div>;

  return (
    <div style={s.container}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'error' ? '#f44336' : '#4CAF50' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🏢 Branch Management</h1>
          <p style={s.subtitle}>Manage all company branch locations. Only admins can add, edit, or delete branches.</p>
        </div>
        <button onClick={openAdd} style={s.addBtn}>+ Add New Branch</button>
      </div>

      {/* Stats Row */}
      <div style={s.statsRow}>
        <div style={s.statBox}>
          <span style={s.statNum}>{branches.length}</span>
          <span style={s.statLabel}>Total Branches</span>
        </div>
        <div style={s.statBox}>
          <span style={s.statNum}>{branches.filter(b => b.name !== 'Remote').length}</span>
          <span style={s.statLabel}>Physical Offices</span>
        </div>
        <div style={s.statBox}>
          <span style={s.statNum}>{branches.filter(b => b.name === 'Remote').length}</span>
          <span style={s.statLabel}>Remote</span>
        </div>
      </div>

      {/* Branch Cards */}
      {branches.length > 0 ? (
        <div style={s.grid}>
          {branches.map(branch => (
            <div key={branch._id} style={s.card}>
              <div style={s.cardTop}>
                <span style={s.icon}>{BRANCH_ICONS[branch.name] || '🏢'}</span>
                <div style={s.cardTitles}>
                  <h2 style={s.branchName}>{branch.name}</h2>
                  <p style={s.branchAddress}>📍 {branch.address || 'No address set'}</p>
                </div>
              </div>
              {branch.contact && (
                <p style={s.contact}>📞 {branch.contact}</p>
              )}
              <div style={s.cardFooter}>
                <button onClick={() => openEdit(branch)} style={s.editBtn}>✏️ Edit</button>
                <button onClick={() => handleDelete(branch._id, branch.name)} style={s.deleteBtn}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={s.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
          <h3 style={{ color: dm ? '#fff' : '#555' }}>No branches found</h3>
          <p style={{ color: dm ? '#aaa' : '#888' }}>Click "Add New Branch" to create your first branch.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={{ margin: 0, color: dm ? '#fff' : '#1a1a2e' }}>
                {isEditing ? '✏️ Edit Branch' : '🏢 Add New Branch'}
              </h2>
              <button onClick={() => setShowModal(false)} style={s.closeBtn}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.inputGroup}>
                <label style={s.label}>Branch Name *</label>
                <select
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={s.input}
                  required
                >
                  <option value="">-- Select Branch City --</option>
                  <option value="Islamabad">🏛️ Islamabad</option>
                  <option value="Lahore">🌆 Lahore</option>
                  <option value="Karachi">🌊 Karachi</option>
                  <option value="Remote">🌐 Remote</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={s.input}
                  placeholder="e.g. Blue Area, Islamabad"
                />
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>Contact Number</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={e => setFormData({ ...formData, contact: e.target.value })}
                  style={s.input}
                  placeholder="e.g. +92-51-1234567"
                />
              </div>

              <div style={s.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" disabled={submitting} style={s.submitBtn}>
                  {submitting ? 'Saving...' : isEditing ? '💾 Update Branch' : '✅ Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBranches;
