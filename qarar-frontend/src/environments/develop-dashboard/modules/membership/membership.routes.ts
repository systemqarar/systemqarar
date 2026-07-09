import React from 'react';
import { RouteObject } from 'react-router-dom';
import MembershipDashboard from './membership-dashboard/pages/MembershipDashboard';
// 1. ✨ أضفنا السطر ده عشان نستدعي شاشة الهيكل التنفيذي الجديدة
import { ExecutiveBoardPage } from './executive-board/pages/ExecutiveBoardPage';

const membershipRoutes: RouteObject[] = [
  {
    path: 'membership',
    element: React.createElement(MembershipDashboard)
  },
  {
    // 2. ✨ أضفنا المسار الجديد ده عشان الأدمن لما يضغط عليه يفتح ليه الشاشة فوراً
    path: 'membership/executive-board',
    element: React.createElement(ExecutiveBoardPage)
  }
];

export default membershipRoutes;
