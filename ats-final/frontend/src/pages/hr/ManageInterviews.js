import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/axios';
import { ThemeContext } from '../../context/ThemeContext';

const ManageInterviews = () => {
  const [interviews, setInterviews]   = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [currentIntId, setCurrentIntId] = useState(null);
  const [toast, setToast]             = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const { darkMode }                  = useContext(ThemeContext);

  const dm = darkMode;

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [intRes, appRes] = await Promise.all([
        api.get('/interviews'),
        api.get('/applications')
      ]);
      setInterviews(intRes.data);
      const validApps = appRes.data.filter(a =>
        ['Shortlisted', 'Under Review', 'Interview Scheduled'].includes(a.status)
      );
      setApplications(validApps);
    } catch (err) {
      showToast('Failed to load data.', 'error');
    } finally { setLoading(false); }
  };

  const handleInputChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const [formData, setFormData] = useState({
    application: '', date: '', time: '', message: ''
  });

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ application: '', date: '', time: '', message: '' });
    setShowModal(true);
  };

  const openEditModal = (interview) => {
    setIsEditing(true);
    setCurrentIntId(interview._id);
    setFormData({
      application: interview.application?._id || '',
      date: new Date(interview.date).toISOString().split('T')[0],
      time: interview.time,
      message: interview.message || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview? This cannot be undone.')) return;
    try {
      await api.delete(`/interviews/${id}`);
      showToast('Interview deleted successfully.');
      fetchData();
    } catch (err) {
      showToast('Error deleting interview.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/interviews/${currentIntId}`, {
          date: formData.date, time: formData.time, message: formData.message
        });
        showToast('Interview updated successfully!');
      } else {
        const res = await api.post('/interviews', {
          application: formData.application,
          date: formData.date,
          time: formData.time,
          message: formData.message
        });
        showToast('Interview scheduled!');

        try {
          const appRes = await api.get(`/applications/${formData.application}`);
          const appData = appRes.data;
          await api.post('/email/interview', {
            email: appData.candidate?.email,
            name: appData.candidate?.name,
            jobTitle: appData.job?.title,
            date: formData.date,
            time: formData.time,
            message: formData.message,
            candidateId: appData.candidate?._id
          });
          showToast('✅ Interview scheduled & email sent to candidate!');
        } catch (emailErr) {
          console.warn('Interview email failed:', emailErr.message);
          showToast('Interview scheduled! (Email notification failed — check email config)', 'warn');
        }
      }

      setShowModal(false);
      setCurrentIntId(null);
      setFormData({ application: '', date: '', time: '', message: '' });
      fetchData();
    } catch (err) {
      showToast('Error: ' + (err.response?.data?.message || 'Unknown error'), 'error');
    } finally { setSubmitting(false); }
  };

  const handleSendInterviewEmail = async (interview) => {
    if (!window.confirm(`Resend interview email to ${interview.candidate?.name}?`)) return;
    try {
      await api.post('/email/interview', {
        email: interview.candidate?.email,
        name: interview.candidate?.name,
        jobTitle: interview.job?.title,
        date: interview.date,
        time: interview.time,
        message: interview.message,
        candidateId: interview.candidate?._id
      });
      showToast(`Interview email resent to ${interview.candidate?.name}!`);
    } catch {
      showToast('Email failed. Check email configuration.', 'error');
    }
  };

  const s = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' },
    toast: { position: 'fixed', top: '20px', right: '20px', color: '#fff', padding: '14px 22px', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', zIndex: 9999, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', maxWidth: '380px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: `2px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingBottom: '1rem' },
    title: { margin: 0, color: dm ? '#fff' : '#1a1a2e', fontSize: '2rem', fontWeight: '800' },
    addBtn: { background: '#9C27B0', color: '#fff', border: 'none', padding: '13px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 10px rgba(156,39,176,0.3)' },
    loading: { textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: '#666' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.8rem' },
    card: { display: 'flex', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow)', overflow: 'hidden', border: dm ? '1px solid #2d2d4e' : 'none' },
    calendarStrip: { background: dm ? '#000' : '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem', minWidth: '100px' },
    calMonth: { fontSize: '1rem', fontWeight: '800', letterSpacing: '2px', color: '#FFC107' },
    calDay: { fontSize: '3rem', fontWeight: '800', margin: '4px 0', lineHeight: 1 },
    calYear: { fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px' },
    calTime: { fontSize: '0.85rem', background: 'rgba(255,255,255,0.12)', padding: '4px 8px', borderRadius: '4px' },
    cardBody: { padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column' },
    candidateHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
    candidateName: { margin: '0 0 4px', color: dm ? '#fff' : '#1a1a2e', fontSize: '1.2rem', fontWeight: '700' },
    candidateEmail: { margin: 0, color: dm ? '#aaa' : '#888', fontSize: '0.82rem' },
    actionButtons: { display: 'flex', gap: '6px', flexShrink: 0 },
    emailIconBtn:  { background: dm ? '#16213e' : '#e3f2fd', border: `1px solid ${dm ? '#2d2d4e' : '#90caf9'}`, borderRadius: '5px', padding: '5px 9px', cursor: 'pointer', fontSize: '0.9rem' },
    editIconBtn:   { background: dm ? '#16213e' : '#f5f5f5', border: `1px solid ${dm ? '#2d2d4e' : '#ddd'}`, borderRadius: '5px', padding: '5px 9px', cursor: 'pointer', fontSize: '0.9rem' },
    deleteIconBtn: { background: dm ? '#16213e' : '#ffebee', border: `1px solid ${dm ? '#F44336' : '#ef9a9a'}`, borderRadius: '5px', padding: '5px 9px', cursor: 'pointer', fontSize: '0.9rem', color: '#F44336' },
    jobTitle: { color: dm ? '#fff' : '#666', fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px' },
    messageBox: { background: dm ? '#16213e' : '#f8f9fa', padding: '12px', borderRadius: '7px', fontSize: '0.9rem', color: dm ? '#eee' : '#444', flex: 1, borderLeft: '4px solid #9C27B0', marginBottom: '10px', border: dm ? '1px solid #2d2d4e' : 'none', borderLeftWidth: '4px' },
    emailNote: { fontSize: '0.78rem', color: '#9C27B0', fontStyle: 'italic', marginTop: 'auto', paddingTop: '8px' },
    emptyText: { gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '10px', boxShadow: 'var(--shadow)', color: 'var(--text-color)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '650px', boxShadow: 'var(--shadow)', maxHeight: '90vh', overflowY: 'auto', border: dm ? '1px solid #2d2d4e' : 'none' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingBottom: '1rem' },
    closeBtn: { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#aaa', lineHeight: 1 },
    form: { display: 'flex', flexDirection: 'column', gap: '1.4rem' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '7px' },
    label: { fontSize: '0.9rem', color: dm ? '#aaa' : '#555', fontWeight: '700' },
    input: { padding: '13px', border: `1px solid ${dm ? '#2d2d4e' : '#ddd'}`, borderRadius: '6px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', background: 'var(--input-bg)', color: 'var(--text-color)' },
    select: { padding: '13px', border: `1px solid ${dm ? '#2d2d4e' : '#ddd'}`, borderRadius: '6px', fontSize: '0.95rem', outline: 'none', background: 'var(--input-bg)', color: 'var(--text-color)' },
    emailInfoBox: { background: dm ? '#2d2d4e' : '#f3e5f5', border: `1px solid ${dm ? '#9C27B0' : '#ce93d8'}`, borderRadius: '6px', padding: '12px 16px', fontSize: '0.88rem', color: dm ? '#ce93d8' : '#4a148c' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem', borderTop: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingTop: '1.4rem' },
    cancelBtn: { background: dm ? '#2d2d4e' : '#f5f5f5', border: `1px solid ${dm ? '#444' : '#ccc'}`, color: dm ? '#eee' : '#555', padding: '11px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' },
    submitBtn: { background: '#9C27B0', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(156,39,176,0.3)' },
  };

  if (loading) return <div style={s.loading}>Loading Interview Calendar...</div>;

  return (
    <div style={s.container}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'error' ? '#f44336' : toast.type === 'warn' ? '#FF9800' : '#4CAF50' }}>
          {toast.msg}
        </div>
      )}

      <div style={s.header}>
        <h1 style={s.title}>Interview Schedule</h1>
        <button onClick={openAddModal} style={s.addBtn}>+ Schedule New Interview</button>
      </div>

      <div style={s.grid}>
        {interviews.length > 0 ? interviews.map(interview => {
          const dateObj = new Date(interview.date);
          const month   = dateObj.toLocaleString('default', { month: 'short' });
          const day     = dateObj.getDate();
          const year    = dateObj.getFullYear();

          return (
            <div key={interview._id} style={s.card}>
              <div style={s.calendarStrip}>
                <div style={s.calMonth}>{month.toUpperCase()}</div>
                <div style={s.calDay}>{day}</div>
                <div style={s.calYear}>{year}</div>
                <div style={s.calTime}>{interview.time}</div>
              </div>
              <div style={s.cardBody}>
                <div style={s.candidateHeader}>
                  <div>
                    <h3 style={s.candidateName}>{interview.candidate?.name || 'Unknown'}</h3>
                    <p style={s.candidateEmail}>✉️ {interview.candidate?.email}</p>
                  </div>
                  <div style={s.actionButtons}>
                    <button onClick={() => handleSendInterviewEmail(interview)} style={s.emailIconBtn} title="Resend Interview Email">📧</button>
                    <button onClick={() => openEditModal(interview)} style={s.editIconBtn} title="Edit">✏️</button>
                    <button onClick={() => handleDelete(interview._id)} style={s.deleteIconBtn} title="Delete">🗑️</button>
                  </div>
                </div>
                <p style={s.jobTitle}>💼 {interview.job?.title}</p>
                {interview.message && (
                  <div style={s.messageBox}>
                    <strong style={{ color: dm ? '#FFC107' : '#9C27B0' }}>📋 Instructions / Meeting Link:</strong>
                    <p style={{ margin: '6px 0 0', whiteSpace: 'pre-line', fontSize: '0.9rem', color: dm ? '#fff' : '#444' }}>{interview.message}</p>
                  </div>
                )}
                <div style={s.emailNote}>
                  📧 Email auto-sent on schedule
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={s.emptyText}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📅</div>
            <h3>No interviews scheduled yet</h3>
            <p>Click the button above to schedule your first interview.</p>
          </div>
        )}
      </div>

      {/* ── Schedule / Edit Modal ── */}
      {showModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h2 style={{ margin: 0, color: dm ? '#fff' : '#1a1a2e' }}>
                {isEditing ? '✏️ Update Interview' : '📅 Schedule New Interview'}
              </h2>
              <button onClick={() => setShowModal(false)} style={s.closeBtn}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={s.form}>
              {!isEditing && (
                <div style={s.inputGroup}>
                  <label style={s.label}>Select Candidate Application *</label>
                  <select name="application" value={formData.application}
                    onChange={handleInputChange} style={s.select} required>
                    <option value="">-- Choose a Candidate --</option>
                    {applications.map(app => (
                      <option key={app._id} value={app._id}>
                        {app.candidate?.name} — {app.job?.title} ({app.status})
                      </option>
                    ))}
                  </select>
                  {applications.length === 0 && (
                    <p style={{ color: '#f44336', fontSize: '0.85rem', margin: '6px 0 0' }}>
                      ⚠️ No eligible candidates (Shortlisted / Under Review). Update application status first.
                    </p>
                  )}
                </div>
              )}

              <div style={s.formGrid}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Interview Date *</label>
                  <input type="date" name="date" value={formData.date}
                    onChange={handleInputChange} style={s.input} required />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>Interview Time *</label>
                  <input type="time" name="time" value={formData.time}
                    onChange={handleInputChange} style={s.input} required />
                </div>
              </div>

              <div style={s.inputGroup}>
                <label style={s.label}>Meeting Details / Instructions *</label>
                <textarea name="message" value={formData.message}
                  onChange={handleInputChange}
                  style={{ ...s.input, height: '120px', resize: 'vertical' }}
                  required
                  placeholder="e.g. Zoom Link: https://zoom.us/j/123456789&#10;Please join 5 minutes early and keep your resume handy." />
              </div>

              {!isEditing && (
                <div style={s.emailInfoBox}>
                  📧 <strong>An interview invitation email will be automatically sent</strong> to the candidate after scheduling.
                </div>
              )}

              <div style={s.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" disabled={submitting} style={s.submitBtn}>
                  {submitting ? 'Processing...' : isEditing ? '💾 Update Details' : '📅 Schedule & Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInterviews;
