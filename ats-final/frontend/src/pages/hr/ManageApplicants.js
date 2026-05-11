import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/axios';
import { ThemeContext } from '../../context/ThemeContext';

const STATUS_COLORS = (dm) => ({
  'Submitted':           { bg: dm ? '#0d47a1' : '#E3F2FD', text: dm ? '#fff' : '#1565C0' },
  'Under Review':        { bg: dm ? '#ff8f00' : '#FFF8E1', text: dm ? '#fff' : '#E65100' },
  'Shortlisted':         { bg: dm ? '#2e7d32' : '#E8F5E9', text: dm ? '#fff' : '#2E7D32' },
  'Interview Scheduled': { bg: dm ? '#6a1b9a' : '#F3E5F5', text: dm ? '#fff' : '#6A1B9A' },
  'Selected':            { bg: dm ? '#00695c' : '#E0F2F1', text: dm ? '#fff' : '#00695C' },
  'Rejected':            { bg: dm ? '#c62828' : '#FFEBEE', text: dm ? '#fff' : '#B71C1C' },
});

const ALL_STATUSES = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

const ManageApplicants = () => {
  const [applications, setApplications]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filterJob, setFilterJob]           = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [toast, setToast]                   = useState(null);
  const { darkMode }                        = useContext(ThemeContext);

  const dm = darkMode;
  const statusColors = STATUS_COLORS(dm);

  // Email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData]           = useState({ to: '', subject: '', message: '', candidateId: '' });
  const [emailSending, setEmailSending]     = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal]   = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewStatus, setReviewStatus]         = useState('');
  const [reviewNotes, setReviewNotes]           = useState('');
  const [detailsLoading, setDetailsLoading]     = useState(false);

  useEffect(() => { fetchApplications(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      showToast('Failed to load applications.', 'error');
    } finally { setLoading(false); }
  };

  const updateStatus = async (appId, newStatus, app) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      showToast(`Status updated to "${newStatus}"`);

      const candidateEmail = app.candidate?.email;
      const candidateName  = app.candidate?.name;
      const jobTitle       = app.job?.title;
      const candidateId    = app.candidate?._id;

      if (newStatus === 'Shortlisted' && candidateEmail) {
        try {
          await api.post('/email/shortlist', { email: candidateEmail, name: candidateName, jobTitle, candidateId });
          showToast('✅ Status updated & Shortlist email sent!');
        } catch { showToast('Status updated, but email failed. Check email config.', 'warn'); }
      }
      if (newStatus === 'Rejected' && candidateEmail) {
        try {
          await api.post('/email/rejection', { email: candidateEmail, name: candidateName, jobTitle, candidateId });
          showToast('Status updated & Rejection email sent.');
        } catch { showToast('Status updated, but email failed. Check email config.', 'warn'); }
      }
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleQuickEmail = async (app, type) => {
    if (!window.confirm(`Send ${type} email to ${app.candidate?.name}?`)) return;
    try {
      await api.post(`/email/${type}`, {
        email: app.candidate?.email,
        name: app.candidate?.name,
        jobTitle: app.job?.title,
        candidateId: app.candidate?._id,
      });
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} email sent to ${app.candidate?.name}!`);
    } catch { showToast('Email failed. Check email config.', 'error'); }
  };

  const openCustomEmail = (app) => {
    setEmailData({
      to: app.candidate?.email,
      subject: `Regarding your application for ${app.job?.title}`,
      message: '',
      candidateId: app.candidate?._id,
    });
    setShowEmailModal(true);
  };

  const handleCustomEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    try {
      await api.post('/email/custom', {
        email: emailData.to,
        subject: emailData.subject,
        message: emailData.message,
        candidateId: emailData.candidateId,
      });
      showToast('Custom email sent successfully!');
      setShowEmailModal(false);
    } catch { showToast('Email failed. Check email config.', 'error'); }
    finally { setEmailSending(false); }
  };

  const openReviewModal = async (appId) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/applications/${appId}`);
      setSelectedApplication(res.data);
      setReviewStatus(res.data.status);
      setReviewNotes(res.data.evaluationNotes || '');
      setShowReviewModal(true);
    } catch { showToast('Failed to load application details.', 'error'); }
    finally { setDetailsLoading(false); }
  };

  const closeReviewModal = () => { setSelectedApplication(null); setShowReviewModal(false); };

  const handleSaveReview = async () => {
    if (!selectedApplication) return;
    try {
      await api.put(`/applications/${selectedApplication._id}/status`, {
        status: reviewStatus, evaluationNotes: reviewNotes
      });
      setApplications(prev => prev.map(a => a._id === selectedApplication._id ? { ...a, status: reviewStatus } : a));
      showToast('Review saved successfully.');
    } catch { showToast('Failed to save review.', 'error'); }
  };

  const filteredApps = applications.filter(app => {
    const matchJob    = filterJob    ? app.job?.title?.toLowerCase().includes(filterJob.toLowerCase()) : true;
    const matchStatus = filterStatus ? app.status === filterStatus : true;
    return matchJob && matchStatus;
  });

  const s = {
    container: { padding: '2rem', maxWidth: '1300px', margin: '0 auto', position: 'relative' },
    title: { color: dm ? '#fff' : '#1a1a2e', marginBottom: '2rem', fontSize: '2rem', fontWeight: '800' },
    loading: { textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: '#666' },
    toast: { position: 'fixed', top: '20px', right: '20px', color: '#fff', padding: '14px 22px', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', zIndex: 9999, boxShadow: '0 4px 15px rgba(0,0,0,0.2)', maxWidth: '350px' },
    filterBar: { display: 'flex', gap: '20px', marginBottom: '2rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '10px', boxShadow: 'var(--shadow)', flexWrap: 'wrap', alignItems: 'flex-end', border: dm ? '1px solid #2d2d4e' : 'none' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' },
    filterLabel: { fontSize: '0.85rem', fontWeight: '700', color: dm ? '#aaa' : '#555' },
    searchInput: { padding: '11px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', background: 'var(--input-bg)', color: 'var(--text-color)' },
    selectInput: { padding: '11px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '0.95rem', background: 'var(--input-bg)', color: 'var(--text-color)', outline: 'none' },
    countBadge: { background: dm ? '#fff' : '#1a1a2e', color: dm ? '#000' : '#fff', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', textAlign: 'center' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.8rem' },
    card: { background: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: dm ? '1px solid #2d2d4e' : 'none' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.4rem', background: dm ? '#16213e' : '#fcfcfc', borderBottom: `1px solid ${dm ? '#2d2d4e' : '#eee'}` },
    candidateInfo: { display: 'flex', gap: '14px', alignItems: 'center' },
    avatar: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${dm ? '#2d2d4e' : '#e0e0e0'}` },
    avatarPlaceholder: { width: '50px', height: '50px', borderRadius: '50%', background: dm ? '#fff' : '#1a1a2e', color: dm ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '700', flexShrink: 0 },
    candidateName: { margin: '0 0 4px', fontSize: '1.1rem', color: dm ? '#fff' : '#1a1a2e', fontWeight: '700' },
    candidateContact: { margin: '2px 0', color: dm ? '#aaa' : '#666', fontSize: '0.82rem' },
    badge: { padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', flexShrink: 0, whiteSpace: 'nowrap' },
    cardBody: { padding: '1.4rem', flex: 1 },
    jobDetails: { background: dm ? '#16213e' : '#f8f9fa', padding: '12px', borderRadius: '6px', borderLeft: `4px solid ${dm ? '#fff' : '#1a1a2e'}`, marginBottom: '12px', border: dm ? '1px solid #2d2d4e' : 'none', borderLeftWidth: '4px' },
    jobDetailText: { margin: '5px 0', color: dm ? '#eee' : '#333', fontSize: '0.9rem' },
    docLinks: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    docLink: { color: dm ? '#fff' : '#2196F3', textDecoration: 'none', fontWeight: '700', background: dm ? '#2d2d4e' : '#e3f2fd', padding: '6px 12px', borderRadius: '5px', fontSize: '0.85rem', border: dm ? '1px solid #fff' : 'none' },
    actionsContainer: { borderTop: `1px solid ${dm ? '#2d2d4e' : '#eee'}` },
    actionsBox: { padding: '1rem 1.4rem', borderBottom: `1px solid ${dm ? '#2d2d4e' : '#f5f5f5'}` },
    actionTitle: { margin: '0 0 10px', fontSize: '0.75rem', color: dm ? '#888' : '#999', fontWeight: '800', letterSpacing: '1.5px' },
    btnGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    btnReview:   { background: dm ? '#16213e' : '#fff8e1', color: dm ? '#ffb74d' : '#e65100', border: `1px solid ${dm ? '#ffb74d' : '#ffcc80'}`, padding: '7px 13px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' },
    btnShortlist:{ background: dm ? '#16213e' : '#e8f5e9', color: dm ? '#81c784' : '#2e7d32', border: `1px solid ${dm ? '#81c784' : '#a5d6a7'}`, padding: '7px 13px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' },
    btnSelected: { background: dm ? '#fff' : '#e0f2f1', color: dm ? '#000' : '#00695c', border: `1px solid ${dm ? '#ddd' : '#80cbc4'}`, padding: '7px 13px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' },
    btnReject:   { background: dm ? '#16213e' : '#ffebee', color: dm ? '#e57373' : '#c62828', border: `1px solid ${dm ? '#e57373' : '#ef9a9a'}`, padding: '7px 13px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' },
    btnDetails:  { background: dm ? '#16213e' : '#ede7f6', color: dm ? '#b39ddb' : '#4527a0', border: `1px solid ${dm ? '#b39ddb' : '#b39ddb'}`, padding: '7px 13px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' },
    btnEmailSuccess: { background: dm ? '#2e7d32' : '#e8f5e9', color: dm ? '#fff' : '#2e7d32', border: 'none', padding: '7px 13px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' },
    btnEmailDanger:  { background: dm ? '#c62828' : '#ffebee', color: dm ? '#fff' : '#c62828', border: 'none', padding: '7px 13px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' },
    btnEmailAlt:     { background: dm ? '#1565c0' : '#e3f2fd', color: dm ? '#fff' : '#1565c0', border: 'none', padding: '7px 13px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' },
    emptyText: { gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '10px', boxShadow: 'var(--shadow)', color: 'var(--text-color)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '650px', boxShadow: 'var(--shadow)', maxHeight: '90vh', overflowY: 'auto', border: dm ? '1px solid #2d2d4e' : 'none' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', borderBottom: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingBottom: '1rem' },
    closeBtn: { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#aaa', lineHeight: 1 },
    form: { display: 'flex', flexDirection: 'column', gap: '1.4rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '7px' },
    label: { fontSize: '0.9rem', color: dm ? '#aaa' : '#555', fontWeight: '700' },
    input: { padding: '13px', border: `1px solid ${dm ? '#2d2d4e' : '#ddd'}`, borderRadius: '6px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', background: 'var(--input-bg)', color: 'var(--text-color)' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem', borderTop: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, paddingTop: '1.4rem' },
    cancelBtn: { background: dm ? '#2d2d4e' : '#f5f5f5', border: `1px solid ${dm ? '#444' : '#ccc'}`, color: dm ? '#eee' : '#555', padding: '11px 22px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' },
    submitBtn: { background: dm ? '#fff' : '#1a1a2e', color: dm ? '#000' : '#fff', border: 'none', padding: '11px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    reviewBody: { display: 'grid', gap: '1.4rem' },
    reviewSection: { background: dm ? '#16213e' : '#f7f8fb', padding: '1.2rem', borderRadius: '8px', border: `1px solid ${dm ? '#2d2d4e' : '#eef1f6'}` },
    sectionTitle: { margin: '0 0 10px', fontSize: '1rem', color: dm ? '#fff' : '#1a1a2e', fontWeight: '700' },
    docDownloadBtn: { display: 'inline-block', background: dm ? '#fff' : '#1a1a2e', color: dm ? '#000' : '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.87rem', marginRight: '10px', border: dm ? '1px solid #ddd' : 'none' },
  };

  if (loading) return <div style={s.loading}>Loading Applicant Data...</div>;

  return (
    <div style={s.container}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'error' ? '#f44336' : toast.type === 'warn' ? '#FF9800' : '#4CAF50' }}>
          {toast.msg}
        </div>
      )}

      <h1 style={s.title}>Manage Applicants</h1>

      {/* Filters */}
      <div style={s.filterBar}>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Search by Job Title</label>
          <input type="text" placeholder="e.g. Software Engineer" value={filterJob}
            onChange={e => setFilterJob(e.target.value)} style={s.searchInput} />
        </div>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Filter by Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={s.selectInput}>
            <option value="">All Statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>&nbsp;</label>
          <span style={s.countBadge}>{filteredApps.length} applicant(s)</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={s.grid}>
        {filteredApps.length > 0 ? filteredApps.map(app => {
          const sc = statusColors[app.status] || { bg: '#eee', text: '#333' };
          return (
            <div key={app._id} style={s.card}>
              {/* Card Header */}
              <div style={s.cardHeader}>
                <div style={s.candidateInfo}>
                  {app.candidate?.profilePicture
                    ? <img src={app.candidate.profilePicture} alt="Profile" style={s.avatar} />
                    : <div style={s.avatarPlaceholder}>{app.candidate?.name?.charAt(0) || 'U'}</div>
                  }
                  <div>
                    <h3 style={s.candidateName}>{app.candidate?.name || 'Unknown'}</h3>
                    <p style={s.candidateContact}>✉️ {app.candidate?.email}</p>
                    <p style={s.candidateContact}>📞 {app.candidate?.phone || 'N/A'}</p>
                  </div>
                </div>
                <span style={{ ...s.badge, background: sc.bg, color: sc.text }}>{app.status}</span>
              </div>

              {/* Card Body */}
              <div style={s.cardBody}>
                <div style={s.jobDetails}>
                  <p style={s.jobDetailText}><strong>💼 Job:</strong> {app.job?.title} — {app.job?.branch?.name || 'N/A'}</p>
                  <p style={s.jobDetailText}><strong>📅 Applied:</strong> {new Date(app.createdAt).toLocaleDateString('en-PK')}</p>
                </div>
                <div style={s.docLinks}>
                  {app.resume && (
                    <a href={app.resume} download target="_blank" rel="noreferrer" style={s.docLink}>
                      ⬇️ Download Resume
                    </a>
                  )}
                  {app.coverLetter && (
                    <a href={app.coverLetter} download target="_blank" rel="noreferrer" style={s.docLink}>
                      ⬇️ Download Cover Letter
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={s.actionsContainer}>
                <div style={s.actionsBox}>
                  <p style={s.actionTitle}>UPDATE STATUS</p>
                  <div style={s.btnGroup}>
                    <button onClick={() => updateStatus(app._id, 'Under Review', app)} style={s.btnReview}>Under Review</button>
                    <button onClick={() => updateStatus(app._id, 'Shortlisted', app)} style={s.btnShortlist}>✅ Shortlist</button>
                    <button onClick={() => updateStatus(app._id, 'Selected', app)} style={s.btnSelected}>🏆 Select</button>
                    <button onClick={() => updateStatus(app._id, 'Rejected', app)} style={s.btnReject}>❌ Reject</button>
                    <button onClick={() => openReviewModal(app._id)} style={s.btnDetails}>🔍 Full Review</button>
                  </div>
                </div>
                <div style={s.actionsBox}>
                  <p style={s.actionTitle}>SEND EMAIL</p>
                  <div style={s.btnGroup}>
                    <button onClick={() => handleQuickEmail(app, 'shortlist')} style={s.btnEmailSuccess}>📨 Shortlist Email</button>
                    <button onClick={() => handleQuickEmail(app, 'rejection')} style={s.btnEmailDanger}>📨 Reject Email</button>
                    <button onClick={() => openCustomEmail(app)} style={s.btnEmailAlt}>✉️ Custom Message</button>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={s.emptyText}>
            <h3>No applicants found</h3>
            <p>Try adjusting your search filters.</p>
          </div>
        )}
      </div>

      {/* ── Custom Email Modal ── */}
      {showEmailModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h2 style={{ margin: 0, color: dm ? '#fff' : '#1a1a2e' }}>✉️ Compose Custom Email</h2>
              <button onClick={() => setShowEmailModal(false)} style={s.closeBtn}>&times;</button>
            </div>
            <form onSubmit={handleCustomEmailSubmit} style={s.form}>
              <div style={s.inputGroup}>
                <label style={s.label}>To:</label>
                <input type="email" value={emailData.to} disabled style={{ ...s.input, background: dm ? '#2d2d4e' : '#f5f5f5' }} />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Subject:</label>
                <input type="text" value={emailData.subject}
                  onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                  style={s.input} required />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Message:</label>
                <textarea value={emailData.message}
                  onChange={e => setEmailData({ ...emailData, message: e.target.value })}
                  style={{ ...s.input, height: '180px', resize: 'vertical' }}
                  required placeholder="Write your message here..." />
              </div>
              <div style={s.modalFooter}>
                <button type="button" onClick={() => setShowEmailModal(false)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" disabled={emailSending} style={s.submitBtn}>
                  {emailSending ? 'Sending...' : '📤 Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {showReviewModal && selectedApplication && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, maxWidth: '720px' }}>
            <div style={s.modalHeader}>
              <h2 style={{ margin: 0, color: dm ? '#fff' : '#1a1a2e' }}>🔍 Review Application</h2>
              <button onClick={closeReviewModal} style={s.closeBtn}>&times;</button>
            </div>
            {detailsLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>Loading details...</p>
            ) : (
              <div style={s.reviewBody}>
                <div style={s.reviewSection}>
                  <h3 style={s.sectionTitle}>👤 Candidate</h3>
                  <p><strong>Name:</strong> {selectedApplication.candidate?.name}</p>
                  <p><strong>Email:</strong> {selectedApplication.candidate?.email}</p>
                  <p><strong>Phone:</strong> {selectedApplication.candidate?.phone || 'N/A'}</p>
                </div>
                <div style={s.reviewSection}>
                  <h3 style={s.sectionTitle}>💼 Job Details</h3>
                  <p><strong>Title:</strong> {selectedApplication.job?.title}</p>
                  <p><strong>Branch:</strong> {selectedApplication.job?.branch?.name || 'N/A'}</p>
                  <p><strong>Current Status:</strong> <strong style={{ color: statusColors[selectedApplication.status]?.text }}>{selectedApplication.status}</strong></p>
                </div>
                <div style={s.reviewSection}>
                  <h3 style={s.sectionTitle}>📄 Documents</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {selectedApplication.resume && (
                      <a
                        href={selectedApplication.resume}
                        download
                        target="_blank"
                        rel="noreferrer"
                        style={s.docDownloadBtn}
                      >
                        ⬇️ Download Resume
                      </a>
                    )}
                    {selectedApplication.coverLetter && (
                      <a
                        href={selectedApplication.coverLetter}
                        download
                        target="_blank"
                        rel="noreferrer"
                        style={s.docDownloadBtn}
                      >
                        ⬇️ Download Cover Letter
                      </a>
                    )}
                    {!selectedApplication.resume && !selectedApplication.coverLetter && (
                      <p style={{ color: '#aaa', margin: 0 }}>No documents uploaded.</p>
                    )}
                  </div>
                </div>
                <div style={s.reviewSection}>
                  <h3 style={s.sectionTitle}>📝 Evaluation Notes (HR Only)</h3>
                  <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)}
                    style={{ ...s.input, minHeight: '120px', width: '100%', boxSizing: 'border-box' }}
                    placeholder="Add your evaluation notes..." />
                </div>
                <div style={s.reviewSection}>
                  <h3 style={s.sectionTitle}>📊 Update Status</h3>
                  <select value={reviewStatus} onChange={e => setReviewStatus(e.target.value)} style={s.selectInput}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button onClick={closeReviewModal} style={s.cancelBtn}>Close</button>
                  <button onClick={handleSaveReview} style={s.submitBtn}>💾 Save Review</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageApplicants;
