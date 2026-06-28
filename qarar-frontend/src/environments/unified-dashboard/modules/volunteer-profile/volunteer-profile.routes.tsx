// src/environments/unified-dashboard/modules/volunteer-profile/volunteer-profile.routes.tsx

import { RouteObject, Navigate, useNavigate } from 'react-router-dom';
import { PersonalDataPage } from './personal-data/pages/PersonalDataPage';
// 🔐 استيراد الـ Context العام لسيستم قرار لقراءة بيانات الجلسة ديناميكياً
import { useAuth } from '../../../../context/AuthContext'; 

/**
 * 📦 PersonalDataWrapper
 * مكون وسيط لحقن بيانات المتطوع الحالي وإدارة التوجيه الآمن
 */
const PersonalDataWrapper = () => {
  const navigate = useNavigate();
  
  // 👤 سحب بيانات المتطوع الحالي المسجل في المنظومة
  const { user } = useAuth(); 

  /**
   * 🎯 قراءة الـ ID ديناميكياً:
   * السيستم حيشوف أولاً volunteerId، لو مش موجود حيشوف id، لو مفيش خالص حياخد الكود التجريبي
   * (💡 يرجى التأكد من اسم الحقل الفعلي داخل ملف الـ AuthContext وتعديله هنا لو اختلف)
   */
  const volunteerId = user?.volunteerId || user?.id || 'SRCS-2026-9000'; 

  return (
    <PersonalDataPage 
      volunteerId={volunteerId}
      // عند الضغط على زر الرجوع يرجع للوحة التحكم الرئيسية
      onBack={() => navigate('/dashboard')} 
    />
  );
};

// 🛣️ تعريف مسارات موديول البروفايل بنظام التداخل الاحترافي (Nested Routes)
export const volunteerProfileRoutes: RouteObject[] = [
  {
    path: 'profile', // ↩️ لو المتطوع دخل على dashboard/profile مباشرة حيحوله تلقائياً للبيانات الشخصية
    element: <Navigate to="/dashboard/profile/personal-data" replace />,
  },
  {
    path: 'profile/personal-data', // 🪪 الرابط الفعلي الحقيقي والكامل
    element: <PersonalDataWrapper />,
  },
  /* 💡 مستقبلاً لما تعمل صفحة البطاقة الرقمية أو الإعدادات، حترميهم هنا كأبناء بكل سهولة: */
  // {
  //   path: 'profile/digital-card',
  //   element: <DigitalCardPage />,
  // },
];
