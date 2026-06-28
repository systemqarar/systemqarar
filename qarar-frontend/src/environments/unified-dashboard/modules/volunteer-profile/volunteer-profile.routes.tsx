// src/environments/unified-dashboard/modules/volunteer-profile/volunteer-profile.routes.tsx

import { RouteObject, Navigate, useNavigate } from 'react-router-dom'; // ✨ تم تصليح import بالحرف الصغير
import { PersonalDataPage } from './personal-data/pages/PersonalDataPage';

/**
 * 📦 PersonalDataWrapper
 * مكون وسيط لحقن بيانات المتطوع الحالي وإدارة التوجيه الآمن
 */
const PersonalDataWrapper = () => {
  const navigate = useNavigate();
  
  // مؤقتاً للتشغيل لحين ربطه بالـ Auth Context العام لسيستم قرار:
  const volunteerId = 'SRC-KRT-2026-88'; 

  return (
    <PersonalDataPage 
      volunteerId={volunteerId}
      // ✨ تم التعديل ليوافق الروت الرئيسي /dashboard المعتمد في السيستم
      onBack={() => navigate('/dashboard')} 
    />
  );
};

// 🛣️ تعريف مسارات موديول البروفايل (مُسطحة لتتوافق 100% مع لـ .map في AppRoutes)
export const volunteerProfileRoutes: RouteObject[] = [
  {
    path: 'profile', // ↩️ لو المتطوع دخل على dashboard/profile مباشرة حيحوله تلقائياً للبيانات الشخصية
    element: <Navigate to="/dashboard/profile/personal-data" replace />,
  },
  {
    path: 'profile/personal-data', // 🪪 الرابط الفعلي الحقيقي والكامل
    element: <PersonalDataWrapper />,
  },
  /* 💡 مستقبلاً لما تضيف صفحات جديدة، بتضيفها مسطحة كدة بكل سهولة وحتقراها الـ .map طوالي: */
  // {
  //   path: 'profile/digital-card',
  //   element: <DigitalCardPage />,
  // },
];
