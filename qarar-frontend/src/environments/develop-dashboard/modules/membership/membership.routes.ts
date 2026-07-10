import React from 'react';
import { RouteObject } from 'react-router-dom';
import MembershipDashboard from './membership-dashboard/pages/MembershipDashboard';
import { ExecutiveBoardPage } from './executive-board/pages/ExecutiveBoardPage';

// 1️⃣ استدعاء صفحة استثناءات التسجيل الجديدة من مكانها المخصص
import { RegistrationExceptionsPage } from './registration-exceptions/pages/RegistrationExceptionsPage';

const membershipRoutes: RouteObject[] = [
  {
    path: 'membership',
    element: React.createElement(MembershipDashboard)
  },
  {
    path: 'membership/executive-board',
    element: React.createElement(ExecutiveBoardPage)
  },
  {
    // 2️⃣ إضافة المسار الجديد عشان لما تفتح رابط الاستثناءات يوجهك للصفحة فوراً
    path: 'membership/exceptions',
    element: React.createElement(RegistrationExceptionsPage)
  }
];

export default membershipRoutes;
