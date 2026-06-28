import { RouteObject, Navigate, useNavigate } from 'react-router-dom';
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
      // عند الضغط على زر الرجوع يرجع للوحة التحكم الرئيسية
      onBack={() => navigate('/unified-dashboard/overview')} 
    />
  );
};

// 🛣️ تعريف مسارات موديول البروفايل بنظام التداخل الاحترافي (Nested Routes)
export const volunteerProfileRoutes: RouteObject[] = [
  {
    path: 'profile', // 🏢 المسار الأب المشترك للموديول بالكامل
    children: [
      {
        index: true, // ↩️ لو المتطوع دخل على dashboard/profile مباشرة
        element: <Navigate to="personal-data" replace />, // حيحوله تلقائياً ونسبياً لـ profile/personal-data بشكل صحيح 100%
      },
      {
        path: 'personal-data', // 🪪 الرابط الفعلي حيكون تلقائياً: dashboard/profile/personal-data
        element: <PersonalDataWrapper />,
      },
      /* 💡 مستقبلاً لما تعمل صفحة البطاقة الرقمية أو الإعدادات، حترميهم هنا كأبناء للمسار الرئيسي بكل سهولة: */
      // {
      //   path: 'digital-card', // الرابط تلقائياً حيكون: dashboard/profile/digital-card
      //   element: <DigitalCardPage />,
      // },
      // {
      //   path: 'settings', // الرابط تلقائياً حيكون: dashboard/profile/settings
      //   element: <ProfileSettingsPage />,
      // }
    ],
  },
];
