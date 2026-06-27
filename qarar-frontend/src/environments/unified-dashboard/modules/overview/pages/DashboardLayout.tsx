import { useEffect } from 'react'; // 👈 مستشعر المراقبة التلقائي للروابط
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, ClipboardList, MessageSquare, FileText } from 'lucide-react'; // 🌟 تم حذف ArrowRight عشان فيرسال يرضى
import { Outlet, useNavigate } from 'react-router-dom'; 

import { useDashboard } from '../../../../../hooks/useDashboard';
import { SidebarDrawer } from '../../../../../components/SidebarDrawer';
import { GhaithButton } from '../../../../../components/GhaithButton';
import { Header } from '../../../../../components/Header'; 

import { EmergencyCards } from '../components/EmergencyCards';
import { BentoGrid } from '../components/BentoGrid';

export const DashboardLayout = () => {
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useDashboard();
  const navigate = useNavigate(); 

  // 🗺️ روابط متوافقة 100% مع ملف الـ Routes الرئيسي
  const navigationItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home, path: '/dashboard' },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User, path: '/dashboard/profile' },
    { id: 'tasks', name: 'المهام والأنشطة (Tasks & Activities)', icon: ClipboardList, path: '#' },
    { id: 'communication', name: 'مركز التواصل الذكي (Smart Communication)', icon: MessageSquare, path: '#' },
    { id: 'documents', name: 'الخطابات والوثائق (Official Documents)', icon: FileText, path: '#' },
  ];

  // 🔄 المراقبة الذكية لتحويل الروابط فوراً للموبايل
  useEffect(() => {
    const currentItem = navigationItems.find(n => n.id === activeTab);
    if (currentItem && currentItem.path !== '#') {
      navigate(currentItem.path);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden select-none" dir="rtl">
      
      <div className="min-h-screen flex flex-col font-sans text-right pb-32 relative z-10">
        
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
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
              /* 🎯 الأوتلت السحري لعرض موديول البيانات الشخصية */
              <div className="px-5 mt-6">
                <Outlet />
              </div>
            )}
          </AnimatePresence>
        </main>

        {/* زرار مساعد غيث الذكي */}
        <GhaithButton onClick={() => setActiveTab('communication')} />

      </div>

      <SidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

    </div>
  );
};

export default DashboardLayout;
