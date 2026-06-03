import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const emptyForm = {
  applicationId: '',
  student: '',
  drive: '',
  currentRound: '',
  status: 'applied',
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingApplication, setEditingApplication] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');

  const fetchApplicants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/applications', {
        params: { page, limit: 10, search: searchText || undefined },
      });
      setApplications(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students', { params: { page: 1, limit: 100 } });
      setStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await api.get('/drives', { params: { page: 1, limit: 100 } });
      setDrives(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplicants();
    fetchStudents();
    fetchDrives();
  }, [page, searchText]);

  const openEdit = (application) => {
    setEditingApplication(application);
    setForm({
      applicationId: application.applicationId,
      student: application.student?._id || '',
      drive: application.drive?._id || '',
      currentRound: application.currentRound || '',
      status: application.status || 'applied',
    });
  };

  const resetForm = () => {
    setEditingApplication(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        applicationId: form.applicationId,
        student: form.student,
        drive: form.drive,
        currentRound: form.currentRound,
        status: form.status,
      };
      if (editingApplication) {
        await api.patch(`/applications/${editingApplication._id}`, payload);
        setToast('Application updated successfully.');
      } else {
        await api.post('/applications', payload);
        setToast('Application created successfully.');
      }
      resetForm();
      fetchApplicants();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save application.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError('');
    try {
      await api.delete(`/applications/${deleteTarget._id}`);
      setToast('Application deleted successfully.');
      setDeleteTarget(null);
      fetchApplicants();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete application.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Application ID', accessor: 'applicationId' },
    { header: 'Student', accessor: (row) => row.student?.name || '—' },
    { header: 'Drive', accessor: (row) => row.drive?.title || '—' },
    { header: 'Company', accessor: (row) => row.drive?.company?.name || '—' },
    { header: 'Current Round', accessor: 'currentRound' },
    { header: 'Status', accessor: 'status' },
    { header: 'Applied At', accessor: (row) => new Date(row.appliedAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (row) => (
        <div className="table-actions">
          <button className="btn-secondary" type="button" onClick={() => openEdit(row)}>
            Edit
          </button>
          <button className="btn-secondary danger" type="button" onClick={() => setDeleteTarget(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Applications</h2>
          <p>Track applications, update rounds, and manage placement status.</p>
        </div>
      </div>

      <form className="glass-card form-panel" onSubmit={handleSubmit}>
        <h3>{editingApplication ? 'Edit Application' : 'Create Application'}</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="form-grid">
          <label>
            Application ID
            <input
              className="input-field"
              value={form.applicationId}
              onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
              required
            />
          </label>
          <label>
            Student
            <select
              className="input-field"
              value={form.student}
              onChange={(e) => setForm({ ...form, student: e.target.value })}
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
          </label>
          <label>
            Drive
            <select
              className="input-field"
              value={form.drive}
              onChange={(e) => setForm({ ...form, drive: e.target.value })}
              required
            >
              <option value="">Select drive</option>
              {drives.map((drive) => (
                <option key={drive._id} value={drive._id}>
                  {drive.title} — {drive.company?.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Current Round
            <input
              className="input-field"
              value={form.currentRound}
              onChange={(e) => setForm({ ...form, currentRound: e.target.value })}
            />
          </label>
          <label>
            Status
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="applied">applied</option>
              <option value="shortlisted">shortlisted</option>
              <option value="selected">selected</option>
              <option value="rejected">rejected</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingApplication ? 'Update Application' : 'Create Application'}
          </button>
          {editingApplication && (
            <button className="btn-secondary" type="button" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <SearchBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        placeholder="Search applications by company or drive"
      />

      {loading ? (
        <Loader message="Loading applications..." />
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <DataTable columns={columns} data={applications} emptyMessage="No applications found." />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete Application"
        message={`Delete application ${deleteTarget?.applicationId}?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={saving}
      />

      <Toast message={toast} type="success" onClose={() => setToast(null)} />
    </div>
  );
};

export default Applications;
