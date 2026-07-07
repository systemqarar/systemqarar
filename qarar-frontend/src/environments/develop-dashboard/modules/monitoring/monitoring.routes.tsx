import { RouteObject } from 'react-router-dom';
import MonitoringHubPage from './monitoring-dashboard/pages/MonitoringHubPage';
import RenderControlPage from './render-monitoring/pages/RenderControlPage'; // 🚀 استيراد الصفحة الحقيقية الكاملة

const monitoringRoutes: RouteObject[] = [
  {
    path: 'monitoring', // بيعرض الـ Hub المركزي التابع للمراقبة (الـ 4 كروت)
    element: <MonitoringHubPage />
  },
  {
    path: 'monitoring/render', // بيعرض لوحة التحكم التفصيلية والـ Logs الحية لسيرفر ريندر
    element: <RenderControlPage /> // استبدال الصفحة المؤقتة بالصفحة الفعلية
  }
];

export default monitoringRoutes;
