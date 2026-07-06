import { RouteObject } from 'react-router-dom';
import DeveloperOverviewPage from './pages/DeveloperOverviewPage';

// خط المسارات الفرعي والخاص بموديول الـ overview فقط
export const overviewRoutes: RouteObject[] = [
  {
    path: '', // هذا يعني الرابط الأساسي للموديول بدون إضافات
    element: <DeveloperOverviewPage />
  }
];
