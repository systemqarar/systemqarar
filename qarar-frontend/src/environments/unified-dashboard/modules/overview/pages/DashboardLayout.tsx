import { useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, ClipboardList, MessageSquare, FileText } from 'lucide-react'; 
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; 

import { useDashboard } from '../../../../../hooks/useDashboard';
import { SidebarDrawer } from '../../../../../components/SidebarDrawer';
import { GhaithButton } from '../../../../../components/GhaithButton';
import { ActiveUsersButton } from '../../../../../components/ActiveUsersButton'; 
import { Header } from '../../../../../components/Header'; 

import { EmergencyCards } from '../components/EmergencyCards';
import { BentoGrid } from '../components/BentoGrid';

// 🎯 عناصر الملاحة الموحدة (خارج المكون لمنع إعادة التعريف عند كل رندر)
const NAVIGATION_ITEMS = [
  { id: 'overview', name: 'الرئيسية (Overview)', icon: Home, path: '/dashboard' },
  { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User, path: '/dashboard/profile' },
  { id: 'tasks', name: 'المهام والأنشطة (Tasks & Activities)', icon: ClipboardList, path: '/dashboard/tasks-activities' },
  { id: 'communication', name: 'مركز التواصل الذكي (Smart Communication)', icon: MessageSquare, path: '/dashboard/communication' },
  { id: 'letters', name: 'الخطابات والوثائق (Official Documents)', icon: FileText, path: '/dashboard/letters' }, // ✅ تم توحيد المعرف إلى 'letters'
];

export const DashboardLayout = () => {
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useDashboard();
  const navigate = useNavigate(); 
  const location = useLocation(); 

  // 1️⃣ المزامنة التلقائية للمظهر فقط (تغير التبويب النشط دون إجبار المتصفح على Navigation)
  useEffect(() => {
    const currentPath = location.pathname;

    const matchedItem = NAVIGATION_ITEMS.find(item => {
      if (item.path === '/dashboard') {
        return currentPath === '/dashboard' || currentPath === '/dashboard/';
      }
      return currentPath.startsWith(item.path);
    });

    if (matchedItem) {
      setActiveTab(matchedItem.id);
    } else if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
      setActiveTab('overview');
    }
  }, [location.pathname, setActiveTab]);

  // 2️⃣ دالة التوجيه عند الضغط اليدوي الفعلي من قبل المستخدم فقط
  const handleUserTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); 

    const currentItem = NAVIGATION_ITEMS.find(n => n.id === tabId);
    if (currentItem && currentItem.path !== '#') {
      navigate(currentItem.path);
    }
  };

  // فحص ما إذا كان المستخدم في الصفحة الرئيسية للوحة
  const isOverviewRoute = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden select-none" dir="rtl">
      
      <div className="min-h-screen flex flex-col font-sans text-right pb-32 relative z-10">
        
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleUserTabSelect} 
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

        {/* أزرار الإجراءات السريعة */}
        {isOverviewRoute ? (
          <div className="fixed bottom-5 left-5 right-5 z-30 flex items-center gap-3" dir="rtl">
            <div className="flex-[3]">
              <GhaithButton onClick={() => handleUserTabSelect('communication')} isDashboard={true} />
            </div>
            <div className="flex-[2]">
              <ActiveUsersButton />
            </div>
          </div>
        ) : (
          <GhaithButton onClick={() => handleUserTabSelect('communication')} isDashboard={false} />
        )}

      </div>

      {/* 💡 يمرر المكون الآن setActiveTab لتحديد الحالة فقط دون إعادة توجيه تلقائية */}
      <SidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={handleUserTabSelect} 
      />

    </div>
  );
};

export default DashboardLayout;
