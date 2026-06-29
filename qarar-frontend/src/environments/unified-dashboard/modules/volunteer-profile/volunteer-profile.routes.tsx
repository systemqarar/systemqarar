import { RouteObject, useNavigate } from 'react-router-dom';
import { PersonalDataPage } from './personal-data/pages/PersonalDataPage';
// 🆕 استيراد صفحة صالة الاستقبال (لوحة تحكم الملف الشخصي) الجديدة التي أنشأناها سوا
import ProfileDashboardPage from './profile-dashboard/pages/ProfileDashboardPage';
// 🏆 استيراد الصفحة الجديدة الخاصة بالشهادات والبطاقات الرقمية
import { CertificatesCardsPage } from './certificates-cards/pages/CertificatesCardsPage';
// 🔐 استيراد الـ Context العام لسيستم قرار لقراءة بيانات الجلسة ديناميكياً
import { useAuth } from '../../../../context/AuthContext'; 

/**
 * 📦 PersonalDataWrapper
 * مكون وسيط لحقن بيانات المتطوع الحالي وإدارة التوجيه الآمن للبيانات الشخصية
 */
const PersonalDataWrapper = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const volunteerNumber = user?.volunteer_number || user?.id || ''; 

  return (
    <PersonalDataPage 
      volunteerNumber={volunteerNumber} 
      onBack={() => navigate('/dashboard/profile')} 
    />
  );
};

/**
 * 📦 CertificatesCardsWrapper
 * مكوّن وسيط جديد لحقن بيانات المتطوع في صفحة الشهادات والبطاقات الرقمية
 */
const CertificatesCardsWrapper = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const volunteerNumber = user?.volunteer_number || user?.id || ''; 

  return (
    <CertificatesCardsPage 
      volunteerNumber={volunteerNumber} 
      onBack={() => navigate('/dashboard/profile')} 
    />
  );
};

// 🛣️ تعريف مسارات موديول البروفايل بنظام التداخل الاحترافي (Nested Routes)
export const volunteerProfileRoutes: RouteObject[] = [
  {
    path: 'profile', // ↩️ صالة استقبال الملف الشخصي
    element: <ProfileDashboardPage />,
  },
  {
    path: 'profile/personal-data', // 🪪 رابط صفحة البيانات الشخصية
    element: <PersonalDataWrapper />,
  },
  {
    path: 'profile/certificates-cards', // 🎖️ الرابط الجديد لصفحة الشهادات والبطاقة الرقمية
    element: <CertificatesCardsWrapper />,
  },
];
