import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Award, Settings } from 'lucide-react'; 

const ProfileDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'personal-data',
      title: 'البيانات الشخصية',
      description: 'عرض وتعديل معلوماتك الشخصية الأساسية',
      icon: <User className="w-10 h-10 text-[#800020]" />, 
      path: '/dashboard/profile/personal-data',
    },
    {
      id: 'certificates',
      title: 'البطاقات والشهادات الرقمية',
      description: 'عرض بطاقة حصر الذكية والشهادات المعتمدة',
      icon: <Award className="w-10 h-10 text-[#800020]" />,
      // 🎯 تم التحديث هنا ليتوافق تماماً مع مسار الموديول الجديد
      path: '/dashboard/profile/certificates-cards',
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      description: 'إعدادات الحساب والأمان والتنبيهات',
      icon: <Settings className="w-10 h-10 text-[#800020]" />,
      path: '/dashboard/profile/settings',
    },
  ];

  return (
    <div className="p-6 bg-[#f9fafb] min-h-screen text-right" dir="rtl">
      {/* القسم العلوي: العنوان الرئيسي للمديول */}
      <div className="mb-8">
        <span className="text-gray-400 text-xs sm:text-sm block mb-1">خدمات المتطوع الموحدة</span>
        <h1 className="text-2xl font-bold text-[#1e293b]">إدارة الملف الشخصي</h1>
      </div>

      {/* شبكة الكروت */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="relative flex flex-col items-center justify-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100/70 hover:shadow-md hover:border-gray-200 transition-all duration-200 min-h-[200px] w-full text-center group"
          >
            {/* خلفية دائرية خفيفة للأيقونة تنبض عند تمرير الماوس */}
            <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-red-50 transition-colors duration-200 mb-4">
              {item.icon}
            </div>

            {/* اسم الكرت */}
            <span className="text-lg font-semibold text-gray-800 group-hover:text-[#800020] transition-colors duration-200 mb-1">
              {item.title}
            </span>

            {/* وصف مصغر أسفل الاسم */}
            <span className="text-xs text-gray-400 font-normal max-w-[200px]">
              {item.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileDashboardPage;
