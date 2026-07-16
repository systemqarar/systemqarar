import { useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, ClipboardList, MessageSquare, FileText } from 'lucide-react'; 
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; 

import { useDashboard } from '../../../../../hooks/useDashboard';
import { SidebarDrawer } from '../../../../../components/SidebarDrawer';
import { GhaithButton } from '../../../../../components/GhaithButton';
import { ActiveUsersButton } from '../../../../../components/ActiveUsersButton'; // 🔌 استيراد زر النشطين الجديد
import { Header } from '../../../../../components/Header'; 

import { EmergencyCards } from '../components/EmergencyCards';
import { BentoGrid } from '../components/BentoGrid';

export const DashboardLayout = () => {
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useDashboard();
  const navigate = useNavigate(); 
  const location = useLocation(); 

  // 🗺️ الروابط الأساسية للوحة التحكم
  const navigationItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home, path: '/dashboard' },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User, path: '/dashboard/profile' },
    { id: 'tasks', name: 'المهام والأنشطة (Tasks & Activities)', icon: ClipboardList, path: '#' },
    { id: 'communication', name: 'مركز التواصل الذكي (Smart Communication)', icon: MessageSquare, path: '#' },
    { id: 'documents', name: 'الخطابات والوثائق (Official Documents)', icon: FileText, path: '#' },
  ];

  // 1️⃣ مزامنة الـ Tabs مع الرابط الحالي
  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      setActiveTab('overview');
    } else if (location.pathname.includes('/volunteer-profile') || location.pathname.includes('/profile')) {
      setActiveTab('profile');
    }
  }, [location.pathname, setActiveTab]);

  // 2️⃣ دالة موحدة للتحويل عند الضغط الفعلي
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // 🌟 تعديل 1: إغلاق القائمة الجانبية فوراً لمنع الطبقة الشفافة من حجب الضغطات
    setIsSidebarOpen(false); 

    const currentItem = navigationItems.find(n => n.id === tabId);
    if (currentItem && currentItem.path !== '#') {
      navigate(currentItem.path);
    }
  };

  // 🔍 فحص ذكي: هل المتصفح واقف في جذر الـ Dashboard بالظبط؟
  const isOverviewRoute = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden select-none" dir="rtl">
      
      <div className="min-h-screen flex flex-col font-sans text-right pb-32 relative z-10">
        
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AnimatePresence mode="wait">
            {isOverviewRoute ? ( 
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <EmergencyCards />
                <BentoGrid />
              </motion.div>
            ) : (
              /* 🎯 تعديل 2: تحويل الحاوية إلى motion.div وإعطائها مفتاحاً ذكياً يعتمد على المسار لمنع تجمد الشاشة وضمان سلاسة الانتقال */
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="px-5 mt-6"
              >
                <Outlet />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* 🌟 3️⃣ عرض الأزرار بطريقة مرنة وشرطية بالكامل لمنع التداخل */}
        {isOverviewRoute ? (
          /* في صفحة الداشبورد الرئيسية: نقسم المساحة لـ 60% غيث و 40% النشطين */
          <div className="fixed bottom-5 left-5 right-5 z-30 flex items-center gap-3" dir="rtl">
            <div className="flex-[3]">
              <GhaithButton onClick={() => handleTabChange('communication')} isDashboard={true} />
            </div>
            <div className="flex-[2]">
              <ActiveUsersButton />
            </div>
          </div>
        ) : (
          /* في باقي الصفحات الفرعية: يظهر زر غيث منفرداً في وضعه الثابت الطبيعي بكامل العرض */
          <GhaithButton onClick={() => handleTabChange('communication')} isDashboard={false} />
        )}

      </div>

      <SidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
      />

    </div>
  );
};

export default DashboardLayout;
