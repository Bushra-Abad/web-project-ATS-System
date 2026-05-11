import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { ThemeContext } from '../context/ThemeContext';

const PublicJobList = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  const dm = darkMode;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data);
      } catch (error) {
        console.error('Error fetching jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = branchFilter ? job.branch?.name === branchFilter : true;
    const matchDepartment = departmentFilter ? job.department === departmentFilter : true;
    return matchSearch && matchBranch && matchDepartment && job.status === 'active';
  });

  const s = {
    container: { padding: '0 2rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto' },
    headerBanner: { background: dm ? 'linear-gradient(135deg, #16213e 0%, #0f0f1a 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#fff', padding: '3rem 2rem', borderRadius: '0 0 15px 15px', marginBottom: '2rem', textAlign: 'center' },
    pageTitle: { margin: '0 0 10px 0', fontSize: '2.5rem' },
    subtitle: { margin: 0, fontSize: '1.1rem', opacity: 0.8 },
    filterSection: { display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'center', background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px', boxShadow: 'var(--shadow)', border: dm ? '1px solid #2d2d4e' : 'none' },
    searchInput: { padding: '12px', flex: '1', minWidth: '250px', borderRadius: '6px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-color)', outline: 'none' },
    select: { padding: '12px', borderRadius: '6px', border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-color)', minWidth: '160px', outline: 'none' },
    loading: { textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: dm ? '#aaa' : '#666' },
    jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
    jobCard: { background: 'var(--card-bg)', padding: '1.8rem', borderRadius: '10px', boxShadow: 'var(--shadow)', border: dm ? '1px solid #2d2d4e' : 'none', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
    jobTitle: { margin: 0, color: dm ? '#fff' : '#2c3e50', fontSize: '1.3rem', fontWeight: 'bold' },
    seatBadge: { background: dm ? '#1b5e20' : '#e8f5e9', color: dm ? '#fff' : '#2e7d32', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
    tags: { display: 'flex', gap: '10px', marginBottom: '1.2rem' },
    deptTag: { background: dm ? '#0d47a1' : '#e3f2fd', color: dm ? '#fff' : '#1565c0', padding: '5px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' },
    branchTag: { background: dm ? '#e65100' : '#fff3e0', color: dm ? '#fff' : '#e65100', padding: '5px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' },
    descriptionSnippet: { color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1 },
    viewBtn: { background: dm ? '#fff' : '#1a1a2e', color: dm ? '#000' : '#fff', textDecoration: 'none', padding: '12px', textAlign: 'center', borderRadius: '6px', fontWeight: 'bold', transition: 'background 0.3s' },
    noJobs: { textAlign: 'center', gridColumn: '1 / -1', padding: '3rem', background: 'var(--card-bg)', borderRadius: '8px', color: 'var(--text-color)' }
  };

  return (
    <div style={s.container}>
      <div style={s.headerBanner}>
        <h1 style={s.pageTitle}>Find Your Dream Job</h1>
        <p style={s.subtitle}>Explore opportunities across our various branches and departments.</p>
      </div>
      
      <div style={s.filterSection}>
        <input 
          type="text" 
          placeholder="Search jobs by title..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={s.searchInput}
        />
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={s.select}>
          <option value="">All Branches</option>
          <option value="Islamabad">Islamabad</option>
          <option value="Lahore">Lahore</option>
          <option value="Karachi">Karachi</option>
          <option value="Remote">Remote</option>
        </select>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={s.select}>
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Marketing">Marketing</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
        </select>
      </div>

      {loading ? (
        <div style={s.loading}>Loading opportunities...</div>
      ) : (
        <div style={s.jobGrid}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job._id} style={s.jobCard}>
                <div style={s.cardHeader}>
                  <h3 style={s.jobTitle}>{job.title}</h3>
                  <span style={s.seatBadge}>{job.seats} seats</span>
                </div>
                <div style={s.tags}>
                  <span style={s.deptTag}>{job.department}</span>
                  <span style={s.branchTag}>📍 {job.branch?.name}</span>
                </div>
                <p style={s.descriptionSnippet}>
                  {job.description.length > 100 ? `${job.description.substring(0, 100)}...` : job.description}
                </p>
                <Link to={`/jobs/${job._id}`} style={s.viewBtn}>View Details</Link>
              </div>
            ))
          ) : (
            <div style={s.noJobs}>
              <h3>No jobs found matching your criteria.</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicJobList;
