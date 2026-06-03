import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;
      setLoading(true);
      try {
        if (user.role === 'admin' || user.role === 'placement_officer') {
          const [analyticsRes, studentsRes, companiesRes, drivesRes, applicationsRes, interviewsRes] = await Promise.all([
            api.get('/analytics/placements'),
            api.get('/students', { params: { page: 1, limit: 1 } }),
            api.get('/companies', { params: { page: 1, limit: 1 } }),
            api.get('/drives', { params: { page: 1, limit: 1 } }),
            api.get('/applications', { params: { page: 1, limit: 1 } }),
            api.get('/interviews'),
          ]);
          setStats(analyticsRes.data.data);
          setSummary({
            students: studentsRes.data.total || 0,
            companies: companiesRes.data.total || 0,
            drives: drivesRes.data.total || 0,
            applications: applicationsRes.data.pagination?.total || 0,
            interviews: interviewsRes.data.data?.length || 0,
          });
        } else {
          const [applicationsRes, interviewsRes] = await Promise.all([
            api.get('/applications', { params: { page: 1, limit: 100 } }),
            api.get('/interviews'),
          ]);
          const myApps = applicationsRes.data.data || [];
          const interviewMap = (interviewsRes.data.data || []).filter(
            (interview) => interview.application?.student?.email === user.email
          );
          const upcoming = interviewMap.filter((interview) => new Date(interview.scheduledAt) > new Date());
          setSummary({
            eligible: 0,
            applied: myApps.length,
            upcoming: upcoming.length,
            interviews: interviewMap.length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user]);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await api.post('/sync');
      setToast(`Sync completed: ${res.data.message}`);
    } catch (err) {
      setToast(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="page-card animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.email}. Your dashboard gives you quick placement insights.</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card">
          <p>Loading dashboard metrics…</p>
        </div>
      ) : user?.role !== 'student' ? (
        <>
          <div className="grid">
            <div className="glass-card">
              <h3>Students</h3>
              <p style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{summary.students ?? '—'}</p>
            </div>
            <div className="glass-card">
              <h3>Companies</h3>
              <p style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{summary.companies ?? '—'}</p>
            </div>
            <div className="glass-card">
              <h3>Drives</h3>
              <p style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{summary.drives ?? '—'}</p>
            </div>
            <div className="glass-card">
              <h3>Applications</h3>
              <p style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{summary.applications ?? '—'}</p>
            </div>
          </div>

          {stats && (
            <div className="grid">
              <div className="glass-card">
                <h3>Total Applications</h3>
                <p style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{stats.totalApplications}</p>
              </div>
              <div className="glass-card">
                <h3>Shortlisted</h3>
                <p style={{ fontSize: '2rem', color: '#f59e0b', marginTop: '0.5rem' }}>{stats.shortlistedCount}</p>
              </div>
              <div className="glass-card">
                <h3>Selected</h3>
                <p style={{ fontSize: '2rem', color: 'var(--success)', marginTop: '0.5rem' }}>{stats.selectedCount}</p>
              </div>
              <div className="glass-card">
                <h3>Rejected</h3>
                <p style={{ fontSize: '2rem', color: 'var(--error)', marginTop: '0.5rem' }}>{stats.rejectedCount}</p>
              </div>
            </div>
          )}

          {user?.role === 'admin' && (
            <button className="btn-primary" onClick={handleSync} disabled={syncLoading}>
              {syncLoading ? 'Syncing…' : 'Sync Data'}
            </button>
          )}
        </>
      ) : (
        <div className="grid">
          <div className="glass-card">
            <h3>Applied Drives</h3>
            <p style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{summary.applied ?? '0'}</p>
          </div>
          <div className="glass-card">
            <h3>Upcoming Interviews</h3>
            <p style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{summary.upcoming ?? '0'}</p>
          </div>
          <div className="glass-card">
            <h3>Interviews</h3>
            <p style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>{summary.interviews ?? '0'}</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button className="btn-secondary" type="button" onClick={() => window.location.reload()}>
          Refresh Dashboard
        </button>
      </div>

      {toast && (
        <div className="toast-toast success">
          <span>{toast}</span>
          <button className="toast-close" type="button" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
