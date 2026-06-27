import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Grid, Home, User, ClipboardList, MessageSquare, FileText } from 'lucide-react';

import { useDashboard } from '../../../../../hooks/useDashboard';
import { SidebarDrawer } from '../../../../../components/SidebarDrawer';
import { GhaithButton } from '../../../../../components/GhaithButton';

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
    // الكانفاس الخلفي الثابت بلون غيث الذكي الشيك جداً عند انكماش الصفحة
    <div className="min-h-screen bg-[#0B1528] relative overflow-hidden select-none" dir="rtl">
      
      {/* 🚀 السحر البصري: جسم التطبيق بالكامل ينكمش وتدور زواياه عند فتح القائمة */}
      <motion.div
        animate={{ 
          scale: isSidebarOpen ? 0.93 : 1,
          x: isSidebarOpen ? '-65vw' : '0%', // يزيح الشاشة لليسار لتظهر المنيو باليمين
          borderRadius: isSidebarOpen ? '40px' : '0px'
        }}
        transition={{ type: 'spring', damping: 26, stiffness: 210 }}
        className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-right pb-32 shadow-2xl origin-right relative z-10 overflow-hidden"
      >
        
        {/* الهيدر العلوي */}
        <header className="pt-5 pb-3 px-5 flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-red-100 flex items-center justify-center bg-white text-[#7A1C2E] font-black text-sm shadow-sm">
              ق
            </div>
            <span className="text-sm font-bold text-slate-800">محفظة قرار</span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-700">
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-slate-700" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#7A1C2E] border-2 border-[#f8f9fa] rounded-full" />
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 active:scale-90 transition-transform">
              <Grid className="w-6 h-6 text-[#7A1C2E]" />
            </button>
          </div>
        </header>

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

        {/* مساعد غيث الذكي */}
        <GhaithButton onClick={() => setActiveTab('communication')} />

      </motion.div>

      {/* 🧭 المنيو الجانبية تقع برة وجاهزة للظهور في المساحة الفاضية طالما الشاشة انكمشت */}
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
