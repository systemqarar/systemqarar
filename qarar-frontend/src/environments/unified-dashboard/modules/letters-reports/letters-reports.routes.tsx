import React from 'react';
import { LettersScreen } from './letters-document/pages/LettersScreen';

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
