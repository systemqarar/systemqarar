import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, ClipboardList, MessageSquare, FileText, ArrowRight } from 'lucide-react';

import { useDashboard } from '../../../../../hooks/useDashboard';
import { SidebarDrawer } from '../../../../../components/SidebarDrawer';
import { GhaithButton } from '../../../../../components/GhaithButton';
import { Header } from '../../../../../components/Header'; 

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
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="px-5 mt-6"
              >
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 min-h-[340px] flex flex-col items-center justify-center">
                  {(() => {
                    const item = navigationItems.find(n => n.id === activeTab);
                    const Icon = item?.icon || Home;
                    return (
                      <>
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 text-[#7A1C2E]">
                          <Icon className="w-7 h-7 stroke-[1.5]" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 mb-1">{item?.name}</h2>
                        <p className="text-gray-400 text-[11px] max-w-xs mb-5">
                          تم تفعيل واجهة {item?.name} بنجاح. هنا سيتم ربط ومعالجة البيانات الخاصة بهذا القسم بشكل مستقل.
                        </p>
                        
                        {/* 🛠️ زر الرجوع الذكي والمثالي لحل مشكلة قفل الشاشات الفرعية */}
                        <button
                          onClick={() => setActiveTab('overview')}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 font-bold text-[11px] text-slate-700 transition-all active:scale-95"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-[#7A1C2E]" />
                          الرجوع للوحة الرئيسية
                        </button>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ربط مساعد غيث بالقسم المخصص له تلقائياً عند الضغط */}
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
