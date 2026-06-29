import { RouteObject, useNavigate } from 'react-router-dom';
import { PersonalDataPage } from './personal-data/pages/PersonalDataPage';
// 🆕 استيراد صفحة صالة الاستقبال (لوحة تحكم الملف الشخصي) الجديدة التي أنشأناها سوا
import ProfileDashboardPage from './profile-dashboard/pages/ProfileDashboardPage';
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
   */
  const volunteerNumber = user?.volunteer_number || user?.id || ''; 

  return (
    <PersonalDataPage 
      volunteerNumber={volunteerNumber} 
      // 🔄 تم التعديل هنا: عند الضغط على زر الرجوع يرجع لصالة استقبال الملف الشخصي بدلاً من الداشبورد الخارجي
      onBack={() => navigate('/dashboard/profile')} 
    />
  );
};

// 🛣️ تعريف مسارات موديول البروفايل بنظام التداخل الاحترافي (Nested Routes)
export const volunteerProfileRoutes: RouteObject[] = [
  {
    path: 'profile', // ↩️ الآن عندما يضغط المتطوع على "الملف الشخصي" ستفتح له الواجهة الجديدة مباشرة
    element: <ProfileDashboardPage />,
  },
  {
    path: 'profile/personal-data', // 🪪 الرابط الفعلي لصفحة البيانات الشخصية عند الضغط على الكرت الأول
    element: <PersonalDataWrapper />,
  },
];
