import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

export const StudentRoute = () => <ProtectedRoute allowedRoles={['student']} />;

export default StudentRoute;
