import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { ThemeContext } from '../../context/ThemeContext';

// Status color map
const STATUS_COLORS = {
  'Submitted':          '#2196F3',
  'Under Review':       '#FFC107',
  'Shortlisted':        '#4CAF50',
  'Interview Scheduled':'#9C27B0',
  'Selected':           '#1B5E20',
  'Rejected':           '#F44336',
};

const getStatusColor = (status) => STATUS_COLORS[status] || '#757575';

const HRDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useSocket();

  const [stats, setStats] = useState({ jobs: 0, applications: 0, shortlisted: 0, interviews: 0, selected: 0, rejected: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const { darkMode } = useContext(ThemeContext);


  const buildChartData = (apps) => {
    const counts = {};
    apps.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, appRes, intRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications'),
          api.get('/interviews'),
        ]);

        const jobs = jobsRes.data;
        const apps = appRes.data;
        const ints = intRes.data;

        setStats({
          jobs: jobs.length,
          applications: apps.length,
          shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
          interviews: ints.length,
          selected: apps.filter(a => a.status === 'Selected').length,
          rejected: apps.filter(a => a.status === 'Rejected').length,
        });

        setChartData(buildChartData(apps));

        const sortedApps = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentApplications(sortedApps.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleAdminNotification = (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          message: `Application for "${data.jobTitle}" by ${data.candidateName} updated to "${data.newStatus}"`,
          timestamp: new Date(),
        }, ...prev.slice(0, 9)]);

        // Update stats & chart live
        setStats(prev => {
          const next = { ...prev };
          if (data.newStatus === 'Shortlisted') next.shortlisted += 1;
          if (data.newStatus === 'Selected')    next.selected += 1;
          if (data.newStatus === 'Rejected')    next.rejected += 1;
          return next;
        });
        setChartData(prev => {
          const idx = prev.findIndex(d => d.name === data.newStatus);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], value: updated[idx].value + 1 };
            return updated;
          }
          return [...prev, { name: data.newStatus, value: 1 }];
        });
      };

      const handleNewApplication = (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          message: `New application for "${data.jobTitle}" from ${data.candidateName}`,
          timestamp: new Date(),
        }, ...prev.slice(0, 9)]);
        setStats(prev => ({ ...prev, applications: prev.applications + 1 }));
        setChartData(prev => {
          const idx = prev.findIndex(d => d.name === 'Submitted');
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], value: updated[idx].value + 1 };
            return updated;
          }
          return [...prev, { name: 'Submitted', value: 1 }];
        });
      };

      const handleNewUser = (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          message: `New candidate registered: ${data.name} (${data.email})`,
          timestamp: new Date(),
        }, ...prev.slice(0, 9)]);
      };

      socket.on('admin-application-status-update', handleAdminNotification);
      socket.on('admin-new-application', handleNewApplication);
      socket.on('admin-new-user', handleNewUser);

      return () => {
        socket.off('admin-application-status-update', handleAdminNotification);
        socket.off('admin-new-application', handleNewApplication);
        socket.off('admin-new-user', handleNewUser);
      };
    }
  }, [socket]);

  const dm = darkMode;

  const s = {
    container:    { padding: '2rem', maxWidth: '1300px', margin: '0 auto', minHeight: '100vh', background: dm ? '#0f0f1a' : '#f5f5f5', transition: 'background 0.3s' },
    header:       { marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
    welcome:      { margin: 0, fontSize: '2rem', color: dm ? '#e0e0ff' : '#1a1a2e', fontWeight: 'bold' },
    subtitle:     { color: dm ? '#aaa' : '#666', fontSize: '1rem', marginTop: '6px' },
    loading:      { textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: '#555' },
    notifications:{ background: dm ? '#1a1a2e' : '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', marginBottom: '2rem', border: dm ? '1px solid #2d2d4e' : 'none' },
    notifTitle:   { margin: '0 0 1rem 0', color: dm ? '#e0e0ff' : '#1a1a2e', fontSize: '1.1rem' },
    notifItem:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: `1px solid ${dm ? '#2d2d4e' : '#f5f5f5'}` },
    notifText:    { color: dm ? '#ccc' : '#333', fontSize: '0.9rem' },
    notifTime:    { color: dm ? '#888' : '#999', fontSize: '0.8rem', fontStyle: 'italic', whiteSpace: 'nowrap', marginLeft: '1rem' },
    statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' },
    statCard:     (color) => ({ background: dm ? '#1a1a2e' : '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', textAlign: 'center', borderTop: `5px solid ${color}`, border: dm ? `1px solid #2d2d4e` : undefined, borderTopColor: color }),
    statTitle:    { margin: '0 0 10px 0', color: dm ? '#aaa' : '#777', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' },
    statNumber:   { fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: dm ? '#e0e0ff' : '#1a1a2e' },
    analyticsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' },
    panel:        { background: dm ? '#1a1a2e' : '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', border: dm ? '1px solid #2d2d4e' : 'none' },
    panelTitle:   { margin: '0 0 1.5rem 0', color: dm ? '#e0e0ff' : '#1a1a2e', fontSize: '1.2rem' },
    contentGrid:  { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' },
    tableWrapper: { overflowX: 'auto' },
    table:        { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow:        { borderBottom: `2px solid ${dm ? '#2d2d4e' : '#eee'}`, background: dm ? '#252540' : '#fafafa' },
    th:           { padding: '12px', color: dm ? '#aaa' : '#666', fontWeight: 'bold', fontSize: '0.9rem' },
    tr:           { borderBottom: `1px solid ${dm ? '#2d2d4e' : '#f5f5f5'}` },
    td:           { padding: '12px', color: dm ? '#ccc' : '#444', fontSize: '0.9rem' },
    badge:        { padding: '5px 12px', borderRadius: '25px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' },
    linkText:     { color: '#2196F3', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem' },
    quickLinksGrid:{ display: 'grid', gap: '1rem' },
    quickLink:    { display: 'flex', alignItems: 'center', padding: '15px', background: dm ? '#252540' : '#f8f9fa', color: dm ? '#e0e0ff' : '#1a1a2e', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', border: `1px solid ${dm ? '#2d2d4e' : '#eee'}`, fontSize: '1rem' },
  };

  if (loading) return <div style={s.loading}>Loading HR Dashboard...</div>;

  const statCards = [
    { label: 'Total Jobs',        value: stats.jobs,         color: '#2196F3' },
    { label: 'Applications',      value: stats.applications, color: '#FF9800' },
    { label: 'Shortlisted',       value: stats.shortlisted,  color: '#4CAF50' },
    { label: 'Interviews',        value: stats.interviews,   color: '#9C27B0' },
    { label: 'Selected',          value: stats.selected,     color: '#1B5E20' },
    { label: 'Rejected',          value: stats.rejected,     color: '#F44336' },
  ];

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.welcome}>Welcome back, {user?.name}!</h1>
          <p style={s.subtitle}>HR & Recruitment Dashboard Overview</p>
        </div>
      </div>

      {/* Live Notifications */}
      {notifications.length > 0 && (
        <div style={s.notifications}>
          <h3 style={s.notifTitle}>🔔 Live Activity</h3>
          {notifications.map(n => (
            <div key={n.id} style={s.notifItem}>
              <span style={s.notifText}>{n.message}</span>
              <span style={s.notifTime}>{n.timestamp.toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div style={s.statsGrid}>
        {statCards.map(card => (
          <div key={card.label} style={s.statCard(card.color)}>
            <h3 style={s.statTitle}>{card.label}</h3>
            <p style={s.statNumber}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div style={s.analyticsRow}>
        {/* Pie Chart */}
        <div style={s.panel}>
          <h2 style={s.panelTitle}>📊 Application Status Breakdown</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: dm ? '#888' : '#999', textAlign: 'center', padding: '3rem 0' }}>No application data yet.</p>
          )}
        </div>

        {/* Bar Chart */}
        <div style={s.panel}>
          <h2 style={s.panelTitle}>📈 Status Count</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={dm ? '#2d2d4e' : '#eee'} />
                <XAxis dataKey="name" tick={{ fill: dm ? '#aaa' : '#666', fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: dm ? '#aaa' : '#666', fontSize: 12 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: dm ? '#888' : '#999', textAlign: 'center', padding: '3rem 0' }}>No data to display.</p>
          )}
        </div>
      </div>

      {/* Recent Applications + Quick Actions */}
      <div style={s.contentGrid}>
        <div style={s.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ ...s.panelTitle, margin: 0 }}>Recent Applications</h2>
            <Link to="/hr/applicants" style={s.linkText}>View All →</Link>
          </div>
          {recentApplications.length > 0 ? (
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thRow}>
                    <th style={s.th}>Candidate</th>
                    <th style={s.th}>Job</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map(app => (
                    <tr key={app._id} style={s.tr}>
                      <td style={s.td}><strong>{app.candidate?.name || 'N/A'}</strong></td>
                      <td style={s.td}>{app.job?.title || 'N/A'}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: getStatusColor(app.status) }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={s.td}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: dm ? '#888' : '#666', textAlign: 'center', padding: '2rem' }}>No recent applications found.</p>
          )}
        </div>

        <div style={s.panel}>
          <h2 style={{ ...s.panelTitle }}>⚡ Quick Actions</h2>
          <div style={s.quickLinksGrid}>
            <Link to="/hr/jobs" style={s.quickLink}>💼 Manage Job Postings</Link>
            <Link to="/hr/applicants" style={s.quickLink}>👥 Review Applicants</Link>
            <Link to="/hr/interviews" style={s.quickLink}>📅 Schedule Interviews</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
