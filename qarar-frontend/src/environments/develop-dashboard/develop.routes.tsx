import { RouteObject } from 'react-router-dom';
import { overviewRoutes } from './modules/overview/overview.routes';
import monitoringRoutes from './modules/monitoring/monitoring.routes'; // الاستيراد الجديد لموديول المراقبة
import membershipRoutes from './modules/membership/membership.routes'; // الاستيراد الجديد لموديول العضوية والمناصب

// هنا بنجمع كل روتيس الموديولات الفرعية الخاصة بالمطور في مصفوفة واحدة ليقرأها ملف الأب
export const developRoutes: RouteObject[] = [
  ...overviewRoutes,
  ...monitoringRoutes, // دمج مسارات المراقبة تلقائياً في مصفوفة المطور
  ...membershipRoutes  // دمج مسارات العضوية الجديدة تلقائياً هنا
];
