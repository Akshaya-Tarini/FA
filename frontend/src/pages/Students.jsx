import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ department: '', cgpaMin: '', status: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/students', {
        params: {
          page,
          limit: 10,
          department: filters.department || undefined,
          cgpaMin: filters.cgpaMin || undefined,
          status: filters.status || undefined,
        },
      });
      setStudents(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, filters]);

  const filteredStudents = useMemo(() => {
    if (!searchText.trim()) return students;
    const term = searchText.toLowerCase();
    return students.filter((student) =>
      [student.studentId, student.name, student.email, student.department]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [searchText, students]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ department: '', cgpaMin: '', status: '' });
    setSearchText('');
    setPage(1);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  const columns = [
    { header: 'Student ID', accessor: 'studentId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Department', accessor: 'department' },
    { header: 'CGPA', accessor: 'cgpa' },
    { header: 'Skills', accessor: (row) => row.skills?.join(', ') || '—' },
    { header: 'Graduation', accessor: 'graduationYear' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Status', accessor: 'status' },
  ];

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2>Student Management</h2>
          <p>Search, filter, and inspect your student records.</p>
        </div>
      </div>

      <SearchBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        placeholder="Search students by name, email, or ID"
        filters={[
          { name: 'department', label: 'Department', options: ['CSE', 'ECE', 'ME', 'CE', 'EE'] },
          { name: 'cgpaMin', label: 'Min CGPA', options: ['6', '7', '8', '9'] },
          { name: 'status', label: 'Status', options: ['active', 'placed'] },
        ]}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {loading ? (
        <Loader message="Loading students..." />
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <DataTable
            columns={columns}
            data={filteredStudents}
            onRowClick={handleViewStudent}
            emptyMessage="No students found for this query."
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <h3>Student Details</h3>
            <div className="detail-grid">
              {Object.entries({
                'Student ID': selectedStudent.studentId,
                Name: selectedStudent.name,
                Email: selectedStudent.email,
                Department: selectedStudent.department,
                CGPA: selectedStudent.cgpa,
                Skills: selectedStudent.skills?.join(', '),
                'Graduation Year': selectedStudent.graduationYear,
                Phone: selectedStudent.phone,
                Status: selectedStudent.status,
              }).map(([label, value]) => (
                <div key={label} className="detail-row">
                  <strong>{label}</strong>
                  <span>{value ?? '—'}</span>
                </div>
              ))}
            </div>
            <button type="button" className="btn-primary" onClick={() => setSelectedStudent(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <Toast message={toast} type="success" onClose={() => setToast(null)} />
    </div>
  );
};

export default Students;
