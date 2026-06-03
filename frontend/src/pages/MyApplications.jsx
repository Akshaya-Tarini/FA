import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [interviewMap, setInterviewMap] = useState({});
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');

  const fetchApplications = async () => {
    setPending(true);
    setError('');
    try {
      const [appRes, interviewRes, driveRes] = await Promise.all([
        api.get('/applications', { params: { page: 1, limit: 100 } }),
        api.get('/interviews', { params: { page: 1, limit: 100 } }),
        api.get('/drives', { params: { page: 1, limit: 100 } }),
      ]);
      setApplications(appRes.data.data || []);
      const interviews = interviewRes.data.data || [];
      const map = interviews.reduce((acc, interview) => {
        if (interview.application?._id) {
          acc[interview.application._id] = interview;
        }
        return acc;
      }, {});
      setInterviewMap(map);
      setDrives(driveRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your applications.');
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'student') {
      fetchApplications();
    }
  }, [user]);

  const handleApply = async () => {
    if (!selectedDrive) {
      setError('Please select a drive before applying.');
      return;
    }

    setPending(true);
    setError('');
    try {
      await api.post('/applications', {
        applicationId: `APP-${Date.now()}`,
        drive: selectedDrive,
        currentRound: 'applied',
        status: 'applied',
      });
      setToast('Application submitted successfully.');
      setSelectedDrive('');
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit application.');
    } finally {
      setPending(false);
    }
  };

  const eligibleDrives = useMemo(() => {
    return drives.filter((drive) => drive.status === 'open');
  }, [drives]);

  const columns = [
    { header: 'Application ID', accessor: 'applicationId' },
    { header: 'Company', accessor: (row) => row.drive?.company?.name || '—' },
    { header: 'Drive', accessor: (row) => row.drive?.title || '—' },
    { header: 'Current Round', accessor: 'currentRound' },
    { header: 'Status', accessor: 'status' },
    { header: 'Interview Result', accessor: (row) => interviewMap[row._id]?.result || 'pending' },
    { header: 'Applied At', accessor: (row) => new Date(row.appliedAt).toLocaleDateString() },
  ];

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>My Applications</h2>
          <p>View your application progress and interview results.</p>
        </div>
      </div>

      <div className="glass-card form-panel">
        <h3>Apply to a New Drive</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="form-grid">
          <label>
            Select Drive
            <select
              className="input-field"
              value={selectedDrive}
              onChange={(e) => setSelectedDrive(e.target.value)}
            >
              <option value="">Select an open drive</option>
              {eligibleDrives.map((drive) => (
                <option key={drive._id} value={drive._id}>
                  {drive.title} — {drive.company?.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn-primary" type="button" onClick={handleApply} disabled={pending || !selectedDrive}>
          {pending ? 'Applying...' : 'Apply Now'}
        </button>
      </div>

      {pending ? (
        <Loader message="Loading applications..." />
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <DataTable columns={columns} data={applications} emptyMessage="No applications yet." />
        </>
      )}

      <Toast message={toast} type="success" onClose={() => setToast(null)} />
    </div>
  );
};

export default MyApplications;
