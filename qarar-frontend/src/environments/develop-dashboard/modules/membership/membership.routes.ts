import React from 'react';
import { RouteObject } from 'react-router-dom';
import MembershipDashboard from './membership-dashboard/pages/MembershipDashboard';

const membershipRoutes: RouteObject[] = [
  {
    path: 'membership',
    element: React.createElement(MembershipDashboard)
  }
];

export default membershipRoutes;
