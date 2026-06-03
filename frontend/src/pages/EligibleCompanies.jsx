import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';

const EligibleCompanies = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companyRes, driveRes, studentRes] = await Promise.all([
        api.get('/companies', { params: { page: 1, limit: 100 } }),
        api.get('/drives', { params: { page: 1, limit: 100 } }),
        user?.studentId ? api.get('/students', { params: { studentId: user.studentId, page: 1, limit: 100 } }) : Promise.resolve({ data: { data: [] } }),
      ]);

      const studentProfile = (studentRes.data.data || [])[0] || null;
      setStudent(studentProfile);
      setCompanies(companyRes.data.data || []);
      setDrives(driveRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch eligible companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const eligibleCompanies = useMemo(() => {
    if (!student) return [];
    return companies
      .map((company) => ({
        ...company,
        availableDrive: drives.find(
          (drive) => drive.company?._id === company._id && drive.status === 'open'
        ),
      }))
      .filter((company) => {
        const meetsCgpa = student.cgpa >= company.minCGPA;
        const departmentMatch = company.eligibleDepartments?.includes(student.department);
        return meetsCgpa && departmentMatch;
      });
  }, [companies, drives, student]);

  const handleApply = async (company) => {
    const targetDrive = company.availableDrive;
    if (!targetDrive) {
      setError('No open drive available for this company right now.');
      return;
    }

    setError('');
    try {
      await api.post('/applications', {
        applicationId: `APP-${Date.now()}`,
        drive: targetDrive._id,
        currentRound: 'applied',
        status: 'applied',
      });
      setToast(`Applied to ${company.name}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to apply to company.');
    }
  };

  const columns = [
    { header: 'Company', accessor: 'name' },
    { header: 'Role', accessor: 'role' },
    { header: 'Package', accessor: 'package' },
    { header: 'Drive Date', accessor: (row) => row.driveDate ? row.driveDate.slice(0, 10) : '—' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          className="btn-primary small"
          onClick={() => handleApply(row)}
          disabled={!row.availableDrive}
        >
          {row.availableDrive ? 'Apply' : 'No Open Drive'}
        </button>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Eligible Companies</h2>
          <p>Review companies where you are eligible to apply.</p>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading eligibility data..." />
      ) : (
        <>
          {!student && <div className="info-message">No student profile found for eligibility analysis.</div>}
          {error && <div className="error-message">{error}</div>}
          <DataTable columns={columns} data={eligibleCompanies} emptyMessage="No eligible companies available." />
        </>
      )}

      <Toast message={toast} type="success" onClose={() => setToast(null)} />
    </div>
  );
};

export default EligibleCompanies;
