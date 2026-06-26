import { RouteObject } from 'react-router-dom';
import DashboardLayout from './pages/DashboardLayout';

// موجه المسارات الخاص بموديول لوحة التحكم وفقاً لوثيقة التوجيه الصارمة
export const overviewRoutes: RouteObject[] = [
  {
    path: '', // هذا يعني المسار الرئيسي للوحة التحكم (مثلاً: /dashboard)
    element: <DashboardLayout />,
  }
];
