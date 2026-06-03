import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

export const PlacementOfficerRoute = () => <ProtectedRoute allowedRoles={['admin', 'placement_officer']} />;

export default PlacementOfficerRoute;
