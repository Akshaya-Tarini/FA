import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const emptyForm = {
  driveId: '',
  company: '',
  title: '',
  mode: '',
  location: '',
  registrationDeadline: '',
  rounds: '',
  status: 'open',
};

const Drives = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingDrive, setEditingDrive] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies', { params: { page: 1, limit: 100 } });
      setCompanies(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDrives = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/drives', {
        params: {
          page,
          limit: 10,
          company: searchText || undefined,
          status: statusFilter || undefined,
        },
      });
      setDrives(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch drives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchDrives();
  }, [page, statusFilter, searchText]);

  const openEdit = (drive) => {
    setEditingDrive(drive);
    setForm({
      driveId: drive.driveId,
      company: drive.company?._id || '',
      title: drive.title,
      mode: drive.mode,
      location: drive.location || '',
      registrationDeadline: drive.registrationDeadline ? drive.registrationDeadline.slice(0, 10) : '',
      rounds: drive.rounds?.join(', ') || '',
      status: drive.status,
    });
  };

  const resetForm = () => {
    setEditingDrive(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        driveId: form.driveId,
        company: form.company,
        title: form.title,
        mode: form.mode,
        location: form.location,
        registrationDeadline: form.registrationDeadline,
        rounds: form.rounds.split(',').map((item) => item.trim()).filter(Boolean),
        status: form.status,
      };

      if (editingDrive) {
        await api.patch(`/drives/${editingDrive._id}`, payload);
        setToast('Drive updated successfully.');
      } else {
        await api.post('/drives', payload);
        setToast('Drive created successfully.');
      }

      resetForm();
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save drive.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.delete(`/drives/${deleteTarget._id}`);
      setToast('Drive deleted successfully.');
      setDeleteTarget(null);
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete drive.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Drive ID', accessor: 'driveId' },
    { header: 'Title', accessor: 'title' },
    { header: 'Company', accessor: (row) => row.company?.name || '—' },
    { header: 'Mode', accessor: 'mode' },
    { header: 'Location', accessor: 'location' },
    { header: 'Deadline', accessor: (row) => row.registrationDeadline ? row.registrationDeadline.slice(0, 10) : '—' },
    { header: 'Rounds', accessor: (row) => row.rounds?.join(', ') || '—' },
    { header: 'Status', accessor: 'status' },
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
          <h2>Drives</h2>
          <p>Schedule and manage placement drives for campus recruitment.</p>
        </div>
      </div>

      <form className="glass-card form-panel" onSubmit={handleSubmit}>
        <h3>{editingDrive ? 'Edit Drive' : 'Create Drive'}</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="form-grid">
          <label>
            Drive ID
            <input
              className="input-field"
              value={form.driveId}
              onChange={(e) => setForm({ ...form, driveId: e.target.value })}
              required
            />
          </label>
          <label>
            Company
            <select
              className="input-field"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            >
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label>
            Mode
            <input
              className="input-field"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              required
            />
          </label>
          <label>
            Location
            <input
              className="input-field"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
          <label>
            Registration Deadline
            <input
              className="input-field"
              type="date"
              value={form.registrationDeadline}
              onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
              required
            />
          </label>
          <label>
            Rounds
            <input
              className="input-field"
              value={form.rounds}
              onChange={(e) => setForm({ ...form, rounds: e.target.value })}
              placeholder="Round 1, Round 2"
              required
            />
          </label>
          <label>
            Status
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="open">open</option>
              <option value="closed">closed</option>
              <option value="ongoing">ongoing</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingDrive ? 'Update Drive' : 'Create Drive'}
          </button>
          {editingDrive && (
            <button className="btn-secondary" type="button" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="filter-actions">
        <SearchBar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          placeholder="Search drives by company"
          filters={[{ name: 'status', label: 'Status', options: ['open', 'closed', 'ongoing'] }]}
          filterValues={{ status: statusFilter }}
          onFilterChange={(key, value) => {
            if (key === 'status') setStatusFilter(value);
          }}
          onClear={() => {
            setStatusFilter('');
            setSearchText('');
          }}
        />
      </div>

      {loading ? (
        <Loader message="Loading drives..." />
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <DataTable columns={columns} data={drives} emptyMessage="No drives available." />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete Drive"
        message={`Delete the drive ${deleteTarget?.title}?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={saving}
      />
      <Toast message={toast} type="success" onClose={() => setToast(null)} />
    </div>
  );
};

export default Drives;
