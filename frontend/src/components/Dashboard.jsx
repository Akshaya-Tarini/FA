import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'placement_officer') {
      const fetchAnalytics = async () => {
        try {
          const res = await api.get('/analytics/placements');
          if (res.data.success) {
            setStats(res.data.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchAnalytics();
    }
  }, [user]);

  const handleSync = async () => {
    try {
      const res = await api.post('/sync');
      alert(`Sync completed! \nStudents Processed: ${res.data.data.students}\nCompanies Processed: ${res.data.data.companies}`);
    } catch (err) {
      alert('Sync failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <h1 style={{ marginBottom: '1rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Welcome to your PlacementHub, {user?.email}.</p>

      {user?.role === 'admin' && (
        <div style={{ marginTop: '2rem' }}>
          <button className="btn-primary" onClick={handleSync}>Run Data Sync</button>
        </div>
      )}

      {user?.role !== 'student' && stats && (
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

      {user?.role === 'student' && (
        <div className="grid">
          <div className="glass-card">
            <h3>My Profile</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>View and update your student details.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }}>View Profile</button>
          </div>
          <div className="glass-card">
            <h3>Eligible Drives</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>See companies visiting campus.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }}>Browse Drives</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
