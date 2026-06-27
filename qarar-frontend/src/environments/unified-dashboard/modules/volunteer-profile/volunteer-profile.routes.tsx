import { RouteObject } from 'react-router-dom';
import { PersonalDataPage } from './personal-data/pages/PersonalDataPage';

// 🛣️ تعريف مسارات موديول البروفايل بشكل مستقل تماماً عن باقي النظام
export const volunteerProfileRoutes: RouteObject[] = [
  {
    path: 'profile', // الرابط حيكون: dashboard/profile
    element: <PersonalDataPage onBack={() => window.history.back()} />,
  },
  /* 💡 مستقبلاً لما نعمل صفحة البطاقة أو الإعدادات، حنرمي السطور بتاعتهم هنا تحتها طوالي */
];
