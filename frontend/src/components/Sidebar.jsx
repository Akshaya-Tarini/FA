import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const sidebarItems = role === 'student'
    ? [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/eligible-companies', label: 'Eligible Companies' },
      { path: '/my-applications', label: 'My Applications' },
    ]
    : [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/students', label: 'Students' },
      { path: '/companies', label: 'Companies' },
      { path: '/drives', label: 'Drives' },
      { path: '/applications', label: 'Applications' },
      { path: '/interviews', label: 'Interviews' },
      { path: '/analytics', label: 'Analytics' },
    ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>PlacementHub</span>
        <small>{role?.replace('_', ' ')?.toUpperCase()}</small>
      </div>
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
