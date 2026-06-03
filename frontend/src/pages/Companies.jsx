import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const emptyForm = {
  companyId: '',
  name: '',
  role: '',
  package: '',
  eligibleDepartments: '',
  minCGPA: '',
  driveDate: '',
  status: 'active',
};

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCompany, setEditingCompany] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies', { params: { page, limit: 10 } });
      setCompanies(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  const openEdit = (company) => {
    setEditingCompany(company);
    setForm({
      companyId: company.companyId,
      name: company.name,
      role: company.role,
      package: company.package,
      eligibleDepartments: company.eligibleDepartments?.join(', ') || '',
      minCGPA: company.minCGPA,
      driveDate: company.driveDate ? company.driveDate.slice(0, 10) : '',
      status: company.status,
    });
  };

  const resetForm = () => {
    setEditingCompany(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        companyId: form.companyId,
        name: form.name,
        role: form.role,
        package: Number(form.package),
        eligibleDepartments: form.eligibleDepartments.split(',').map((item) => item.trim()).filter(Boolean),
        minCGPA: Number(form.minCGPA),
        driveDate: form.driveDate,
        status: form.status,
      };

      if (editingCompany) {
        await api.patch(`/companies/${editingCompany._id}`, payload);
        setToast('Company updated successfully.');
      } else {
        await api.post('/companies', payload);
        setToast('Company added successfully.');
      }

      resetForm();
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save company.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.delete(`/companies/${deleteTarget._id}`);
      setToast('Company deleted successfully.');
      setDeleteTarget(null);
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete company.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Company ID', accessor: 'companyId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Role', accessor: 'role' },
    { header: 'Package', accessor: 'package' },
    { header: 'Departments', accessor: (row) => row.eligibleDepartments?.join(', ') || '—' },
    { header: 'Min CGPA', accessor: 'minCGPA' },
    { header: 'Drive Date', accessor: (row) => row.driveDate ? row.driveDate.slice(0, 10) : '—' },
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
          <h2>Companies</h2>
          <p>Manage hiring companies and drive eligibility details.</p>
        </div>
      </div>

      <form className="glass-card form-panel" onSubmit={handleSubmit}>
        <h3>{editingCompany ? 'Edit Company' : 'Add Company'}</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="form-grid">
          <label>
            Company ID
            <input
              className="input-field"
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              required
            />
          </label>
          <label>
            Name
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Role
            <input
              className="input-field"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
          </label>
          <label>
            Package
            <input
              className="input-field"
              type="number"
              min="0"
              value={form.package}
              onChange={(e) => setForm({ ...form, package: e.target.value })}
              required
            />
          </label>
          <label>
            Eligible Departments
            <input
              className="input-field"
              value={form.eligibleDepartments}
              onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })}
              placeholder="CSE, ECE"
            />
          </label>
          <label>
            Min CGPA
            <input
              className="input-field"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={form.minCGPA}
              onChange={(e) => setForm({ ...form, minCGPA: e.target.value })}
              required
            />
          </label>
          <label>
            Drive Date
            <input
              className="input-field"
              type="date"
              value={form.driveDate}
              onChange={(e) => setForm({ ...form, driveDate: e.target.value })}
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
              <option value="active">active</option>
              <option value="completed">completed</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingCompany ? 'Update Company' : 'Create Company'}
          </button>
          {editingCompany && (
            <button className="btn-secondary" type="button" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <Loader message="Fetching companies..." />
      ) : (
        <>
          <DataTable columns={columns} data={companies} emptyMessage="No companies found." />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete Company"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={saving}
      />
      <Toast message={toast} type="success" onClose={() => setToast(null)} />
    </div>
  );
};

export default Companies;
