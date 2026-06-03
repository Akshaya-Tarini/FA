import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Students from './pages/Students';
import Companies from './pages/Companies';
import Drives from './pages/Drives';
import Applications from './pages/Applications';
import Interviews from './pages/Interviews';
import EligibleCompanies from './pages/EligibleCompanies';
import MyApplications from './pages/MyApplications';
import Analytics from './pages/Analytics';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PlacementOfficerRoute } from './components/PlacementOfficerRoute';
import { StudentRoute } from './components/StudentRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<PlacementOfficerRoute />}>
              <Route path="/students" element={<Students />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/drives" element={<Drives />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>

            <Route element={<StudentRoute />}>
              <Route path="/eligible-companies" element={<EligibleCompanies />} />
              <Route path="/my-applications" element={<MyApplications />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
