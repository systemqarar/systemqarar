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
   * 🎯 قراءة رقم المتطوع ديناميكياً:
   * السيستم سيقرأ حقل الـ volunteer_number المعتمد والمربوط بالجلسة الحية.
   * في حال عدم وجوده (مثلاً حساب مسؤول أو حساب جديد)، يمكن الاعتماد على الـ id كخيار احتياطي.
   */
  const volunteerNumber = user?.volunteer_number || user?.id || ''; 

  return (
    <PersonalDataPage 
      // 💡 تم التعديل هنا ليتوافق تماماً مع حقل الـ volunteerNumber الجديد في الصفحة
      volunteerNumber={volunteerNumber} 
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
];
