import React, { useState } from 'react';

/**
 * ResumeViewer — Works with Cloudinary PDF/DOCX URLs
 * No external PDF library needed. Uses browser iframe for PDFs
 * and direct download link for other formats.
 */
const ResumeViewer = ({ url, fileName = 'Document', title = 'View Document' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!url) {
    return (
      <div style={styles.noDoc}>
        <span style={{ fontSize: '2rem' }}>📄</span>
        <p style={styles.noDocText}>No document available</p>
      </div>
    );
  }

  // Detect file type from Cloudinary URL
  const getFileType = (fileUrl) => {
    if (!fileUrl) return 'unknown';
    // Cloudinary raw resource URLs often don't end with .pdf — check for /raw/ or pdf hint
    const lower = fileUrl.toLowerCase();
    if (lower.includes('.pdf') || lower.includes('/raw/') || lower.includes('resource_type=raw')) return 'pdf';
    if (lower.includes('.docx') || lower.includes('.doc')) return 'docx';
    if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp')) return 'image';
    return 'pdf'; // default assumption for Cloudinary resumes
  };

  const fileType = getFileType(url);
  const isPDF = fileType === 'pdf';
  const isImage = fileType === 'image';
  const viewerHeight = isExpanded ? '750px' : '500px';

  // For Cloudinary PDFs — add fl_attachment:false to force inline display
  const getViewUrl = (rawUrl) => {
    // If already a Cloudinary URL, ensure it's viewable inline
    if (rawUrl.includes('cloudinary.com') && rawUrl.includes('/raw/')) {
      // Convert raw upload URL to inline viewable
      return rawUrl.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
    }
    return rawUrl;
  };

  const viewUrl = getViewUrl(url);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h4 style={styles.title}>{title}</h4>
          <p style={styles.fileName}>📄 {fileName}</p>
        </div>
        <div style={styles.btnGroup}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={styles.expandBtn}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '⊗ Collapse' : '⊙ Expand'}
          </button>
          <a href={url} target="_blank" rel="noreferrer" style={styles.openBtn}>
            🔗 Open in New Tab
          </a>
          <a href={url} download style={styles.downloadBtn}>
            ⬇ Download
          </a>
        </div>
      </div>

      {/* Viewer */}
      <div style={{ ...styles.viewerWrap, height: viewerHeight }}>
        {isImage ? (
          <img
            src={url}
            alt={fileName}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
          />
        ) : isPDF && !iframeError ? (
          <iframe
            src={viewUrl}
            title={title}
            style={styles.iframe}
            onError={() => setIframeError(true)}
          />
        ) : (
          /* Fallback for DOCX or if iframe fails */
          <div style={styles.fallback}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>
              {fileType === 'docx' ? '📝' : '📄'}
            </div>
            <p style={styles.fallbackTitle}>
              {fileType === 'docx' ? 'Word Document (.docx)' : 'PDF Document'}
            </p>
            <p style={styles.fallbackSub}>
              {iframeError
                ? 'Preview unavailable due to browser security settings.'
                : 'Preview not supported for this format.'}
            </p>
            <div style={styles.fallbackBtnRow}>
              <a href={url} target="_blank" rel="noreferrer" style={styles.fallbackOpenBtn}>
                🔗 Open in New Tab
              </a>
              <a href={url} download style={styles.fallbackDlBtn}>
                ⬇ Download File
              </a>
            </div>
            {fileType === 'docx' && (
              <p style={styles.tip}>
                💡 Tip: You can also view Word documents by opening the link in Google Docs.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#fff',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: '#f8f9fa',
    borderBottom: '1px solid #eee',
    flexWrap: 'wrap',
    gap: '10px'
  },
  title: { margin: '0 0 3px', fontSize: '1rem', color: '#1a1a2e', fontWeight: '700' },
  fileName: { margin: 0, fontSize: '0.82rem', color: '#777' },
  btnGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  expandBtn: {
    padding: '7px 13px', background: '#e3f2fd', border: '1px solid #90caf9',
    color: '#1565c0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600'
  },
  openBtn: {
    padding: '7px 13px', background: '#1a1a2e', color: '#fff', borderRadius: '6px',
    textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600'
  },
  downloadBtn: {
    padding: '7px 13px', background: '#4CAF50', color: '#fff', borderRadius: '6px',
    textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600'
  },
  viewerWrap: {
    width: '100%',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafafa',
    transition: 'height 0.3s ease'
  },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },
  fallback: { textAlign: 'center', padding: '40px 20px' },
  fallbackTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px' },
  fallbackSub: { color: '#888', fontSize: '0.9rem', marginBottom: '20px' },
  fallbackBtnRow: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  fallbackOpenBtn: {
    padding: '10px 22px', background: '#2196F3', color: '#fff', borderRadius: '6px',
    textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem'
  },
  fallbackDlBtn: {
    padding: '10px 22px', background: '#4CAF50', color: '#fff', borderRadius: '6px',
    textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem'
  },
  tip: { marginTop: '15px', color: '#888', fontSize: '0.82rem' },
  noDoc: { textAlign: 'center', padding: '25px', background: '#f5f5f5', borderRadius: '8px', border: '1px solid #ddd' },
  noDocText: { margin: '8px 0 0', color: '#aaa', fontSize: '0.9rem' }
};

export default ResumeViewer;
