import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, ClipboardList, MessageSquare, FileText } from 'lucide-react';

import { useDashboard } from '../../../../../hooks/useDashboard';
import { SidebarDrawer } from '../../../../../components/SidebarDrawer';
import { GhaithButton } from '../../../../../components/GhaithButton';
import { Header } from '../../../../../components/Header'; // 🚀 الهيدر الملكي الجديد

import { EmergencyCards } from '../components/EmergencyCards';
import { BentoGrid } from '../components/BentoGrid';

export const DashboardLayout = () => {
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useDashboard();

  const navigationItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User },
    { id: 'tasks', name: 'المهام والأنشطة (Tasks & Activities)', icon: ClipboardList },
    { id: 'communication', name: 'مركز التواصل الذكي (Smart Communication)', icon: MessageSquare },
    { id: 'documents', name: 'الخطابات والوثائق (Official Documents)', icon: FileText },
  ];

  return (
    // الخلفية الأساسية بلون غيث الذكي الفخم عند انكماش الصفحة
    <div className="min-h-screen bg-[#0B1528] relative overflow-hidden select-none" dir="rtl">
      
      {/* جسم التطبيق بالكامل ينكمش وتدور زواياه عند فتح القائمة */}
      <motion.div
        animate={{ 
          scale: isSidebarOpen ? 0.93 : 1,
          x: isSidebarOpen ? '-65vw' : '0%', 
          borderRadius: isSidebarOpen ? '40px' : '0px'
        }}
        transition={{ type: 'spring', damping: 26, stiffness: 210 }}
        className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-right pb-32 shadow-2xl origin-right relative z-10 overflow-hidden"
      >
        
        {/* 🏛️ حقن الهيدر المستقل بالبيانات والتحكم الذكي بالأزرار */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* عرض المحتوى الديناميكي حسب التبويب */}
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
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="px-5 mt-6"
              >
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center">
                  {(() => {
                    const item = navigationItems.find(n => n.id === activeTab);
                    const Icon = item?.icon || Home;
                    return (
                      <>
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-[#7A1C2E]">
                          <Icon className="w-8 h-8 stroke-[1.5]" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">{item?.name}</h2>
                        <p className="text-gray-400 text-sm max-w-xs">
                          تم تفعيل واجهة {item?.name} بنجاح. هنا سيتم ربط ومعالجة البيانات الخاصة بهذا القسم بشكل مستقل.
                        </p>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* مساعد غيث الذكي (أسفل الشاشة تماماً لجمالية وراحة اليد) */}
        <GhaithButton onClick={() => setActiveTab('communication')} />

      </motion.div>

      {/* المنيو الجانبية التفاعلية */}
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
