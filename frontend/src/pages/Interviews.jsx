import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const emptyForm = {
  interviewId: '',
  application: '',
  interviewer: '',
  round: '',
  scheduledAt: '',
  result: 'pending',
};

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingInterview, setEditingInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interviews');
      setInterviews(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch interviews.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications', { params: { page: 1, limit: 100 } });
      setApplications(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchInterviews();
  }, []);

  const openEdit = (interview) => {
    setEditingInterview(interview);
    setForm({
      interviewId: interview.interviewId,
      application: interview.application?._id || '',
      interviewer: interview.interviewer,
      round: interview.round,
      scheduledAt: interview.scheduledAt ? interview.scheduledAt.slice(0, 16) : '',
      result: interview.result || 'pending',
    });
  };

  const resetForm = () => {
    setEditingInterview(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        interviewId: form.interviewId,
        application: form.application,
        interviewer: form.interviewer,
        round: form.round,
        scheduledAt: form.scheduledAt,
        result: form.result,
      };

      if (editingInterview) {
        await api.patch(`/interviews/${editingInterview._id}`, { result: form.result });
        setToast('Interview result updated successfully.');
      } else {
        await api.post('/interviews', payload);
        setToast('Interview scheduled successfully.');
      }
      resetForm();
      fetchInterviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save interview.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Interview ID', accessor: 'interviewId' },
    { header: 'Application', accessor: (row) => row.application?.applicationId || '—' },
    { header: 'Student', accessor: (row) => row.application?.student?.name || '—' },
    { header: 'Company', accessor: (row) => row.application?.drive?.company?.name || '—' },
    { header: 'Round', accessor: 'round' },
    { header: 'Interviewed By', accessor: 'interviewer' },
    { header: 'Scheduled At', accessor: (row) => (row.scheduledAt ? new Date(row.scheduledAt).toLocaleString() : '—') },
    { header: 'Result', accessor: 'result' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="table-actions">
          <button className="btn-secondary" type="button" onClick={() => openEdit(row)}>
            Edit Result
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Interviews</h2>
          <p>Schedule interviews and update results for candidates.</p>
        </div>
      </div>

      <form className="glass-card form-panel" onSubmit={handleSubmit}>
        <h3>{editingInterview ? 'Update Interview Result' : 'Schedule Interview'}</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="form-grid">
          {!editingInterview && (
            <label>
              Interview ID
              <input
                className="input-field"
                value={form.interviewId}
                onChange={(e) => setForm({ ...form, interviewId: e.target.value })}
                required
              />
            </label>
          )}
          {!editingInterview && (
            <label>
              Application
              <select
                className="input-field"
                value={form.application}
                onChange={(e) => setForm({ ...form, application: e.target.value })}
                required
              >
                <option value="">Select application</option>
                {applications.map((application) => (
                  <option key={application._id} value={application._id}>
                    {application.applicationId} — {application.student?.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Interviewer
            <input
              className="input-field"
              value={form.interviewer}
              onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
              required
              disabled={!!editingInterview}
            />
          </label>
          <label>
            Round
            <input
              className="input-field"
              value={form.round}
              onChange={(e) => setForm({ ...form, round: e.target.value })}
              required
              disabled={!!editingInterview}
            />
          </label>
          <label>
            Scheduled At
            <input
              className="input-field"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              required
              disabled={!!editingInterview}
            />
          </label>
          <label>
            Result
            <select
              className="input-field"
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
            >
              <option value="pending">pending</option>
              <option value="pass">pass</option>
              <option value="fail">fail</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingInterview ? 'Update Result' : 'Schedule Interview'}
          </button>
          {editingInterview && (
            <button className="btn-secondary" type="button" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <SearchBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        placeholder="Filter interviews by student or company"
      />

      {loading ? (
        <Loader message="Loading interviews..." />
      ) : (
        <>
          <DataTable columns={columns} data={interviews} emptyMessage="No interviews scheduled." />
        </>
      )}

      <Toast message={toast} type="success" onClose={() => setToast(null)} />
    </div>
  );
};

export default Interviews;
