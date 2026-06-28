import { useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, ClipboardList, MessageSquare, FileText } from 'lucide-react'; 
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // ✨ أضفنا useLocation هنا

import { useDashboard } from '../../../../../hooks/useDashboard';
import { SidebarDrawer } from '../../../../../components/SidebarDrawer';
import { GhaithButton } from '../../../../../components/GhaithButton';
import { Header } from '../../../../../components/Header'; 

import { EmergencyCards } from '../components/EmergencyCards';
import { BentoGrid } from '../components/BentoGrid';

export const DashboardLayout = () => {
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useDashboard();
  const navigate = useNavigate(); 
  const location = useLocation(); // ✨ مستشعر الرابط الحالي في المتصفح

  // 🗺️ الروابط الأساسية للوحة التحكم
  const navigationItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home, path: '/dashboard' },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User, path: '/dashboard/profile' },
    { id: 'tasks', name: 'المهام والأنشطة (Tasks & Activities)', icon: ClipboardList, path: '#' },
    { id: 'communication', name: 'مركز التواصل الذكي (Smart Communication)', icon: MessageSquare, path: '#' },
    { id: 'documents', name: 'الخطابات والوثائق (Official Documents)', icon: FileText, path: '#' },
  ];

  // 1️⃣ مزامنة الـ Tabs مع الرابط الحالي (عشان الأيقونات تنور صح لو المستخدم عمل Refresh)
  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      setActiveTab('overview');
    } else if (location.pathname.includes('/volunteer-profile') || location.pathname.includes('/profile')) {
      setActiveTab('profile');
    }
  }, [location.pathname, setActiveTab]);

  // 2️⃣ دالة موحدة للتحويل عند الضغط الفعلي من القائمة الجانبية أو الهيدر
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
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
          setActiveTab={handleTabChange} // ✨ تحويل آمن عبر الدالة المحدثة
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AnimatePresence mode="wait">
            {isOverviewRoute ? ( // ✨ الاعتماد هنا بقى على الرابط الفعلي وليس الـ State
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
              /* 🎯 الأوتلت السحري حيفضل عايش ومستعد يعرض أي صفحة فرعية فوراً */
              <div className="px-5 mt-6">
                <Outlet />
              </div>
            )}
          </AnimatePresence>
        </main>

        <GhaithButton onClick={() => handleTabChange('communication')} />

      </div>

      <SidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} // ✨ تحويل آمن عبر الدالة المحدثة
      />

    </div>
  );
};

export default DashboardLayout;
