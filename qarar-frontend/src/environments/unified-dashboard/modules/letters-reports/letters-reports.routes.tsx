import { LettersScreen } from './letters-document/pages/LettersScreen';

// 🏛️ الحل الجذري: إزالة استيراد React غير المستخدم لتوافق معايير TypeScript Strict ومعالجات Vite الحديثة
// مصفوفة المسارات الخاصة بموديول الخطابات والتقارير بالكامل
export const lettersReportsRoutes = [
  {
    path: 'letters', // حيوصل للرابط: /dashboard/letters
    element: <LettersScreen />,
  },
  /* 📊 يمكنك مستقبلاً إضافة مسار التقارير هنا طوالي لما نشتغل عليه:
  {
    path: 'reports',
    element: <ReportsScreen />,
  }
  */
];
