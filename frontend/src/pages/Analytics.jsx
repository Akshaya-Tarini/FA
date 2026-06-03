import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const Analytics = () => {
  const [placementData, setPlacementData] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [activeTab, setActiveTab] = useState('placements');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [placementRes, deptRes, companyRes] = await Promise.all([ 
        api.get('/analytics/placements'),
        api.get('/analytics/departments'),
        api.get('/analytics/companies'),
      ]);

      setPlacementData(placementRes.data.data);
      setDeptData(deptRes.data.data || []);
      setCompanyData(companyRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const pieData = placementData
    ? [
        { name: 'Shortlisted', value: placementData.shortlistedCount },
        { name: 'Selected', value: placementData.selectedCount },
        { name: 'Rejected', value: placementData.rejectedCount },
      ]
    : [];

  const COLORS = ['#3b82f6', '#10b981', '#ef4444'];

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Analytics</h2>
          <p>Data-driven insights for placements, departments, and companies.</p>
        </div>
      </div>

      <div className="analytics-tabs">
        <button className={activeTab === 'placements' ? 'tab active' : 'tab'} onClick={() => setActiveTab('placements')}>
          Placement Analytics
        </button>
        <button className={activeTab === 'departments' ? 'tab active' : 'tab'} onClick={() => setActiveTab('departments')}>
          Department Analytics
        </button>
        <button className={activeTab === 'companies' ? 'tab active' : 'tab'} onClick={() => setActiveTab('companies')}>
          Company Analytics
        </button>
      </div>

      {loading ? (
        <Loader message="Loading analytics..." />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="analytics-content">
          {activeTab === 'placements' && (
            <div className="analytics-grid">
              <div className="glass-card analytics-card">
                <h3>Total Applications</h3>
                <strong>{placementData.totalApplications}</strong>
              </div>
              <div className="glass-card analytics-card">
                <h3>Shortlisted</h3>
                <strong>{placementData.shortlistedCount}</strong>
              </div>
              <div className="glass-card analytics-card">
                <h3>Selected</h3>
                <strong>{placementData.selectedCount}</strong>
              </div>
              <div className="glass-card analytics-card">
                <h3>Rejected</h3>
                <strong>{placementData.rejectedCount}</strong>
              </div>
              <div className="glass-card chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="analytics-grid">
              <div className="glass-card chart-card">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={deptData}> 
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="placementPercentage" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card analytics-table">
                <table>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Total Students</th>
                      <th>Placement %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptData.map((row) => (
                      <tr key={row.department}>
                        <td>{row.department}</td>
                        <td>{row.totalStudents}</td>
                        <td>{Math.round(row.placementPercentage || 0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="analytics-grid">
              <div className="glass-card chart-card">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={companyData}> 
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="selectedStudents" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card analytics-table">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Selected</th>
                      <th>Highest Package</th>
                      <th>Drive Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyData.map((company) => (
                      <tr key={company._id}>
                        <td>{company.name}</td>
                        <td>{company.selectedStudents}</td>
                        <td>{company.highestPackage}</td>
                        <td>{company.driveParticipationCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
