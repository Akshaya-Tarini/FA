import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

export const AdminRoute = () => <ProtectedRoute allowedRoles={['admin']} />;

export default AdminRoute;
