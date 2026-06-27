import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Grid, Home, User, ClipboardList, MessageSquare, FileText } from 'lucide-react';

// 🔌 استيراد الماكينة المركزية والمكونات العامة (من المجلد الرئيسي برا)
import { useDashboard } from '../../../../../hooks/useDashboard';
import { SidebarDrawer } from '../../../../../components/SidebarDrawer';
import { GhaithButton } from '../../../../../components/GhaithButton';

// 🎯 استيراد المكونات الخاصة بموديول الأوفرفيو (من مجلد المكونات الداخلي)
import { EmergencyCards } from '../components/EmergencyCards';
import { BentoGrid } from '../components/BentoGrid';

export const DashboardLayout = () => {
  // ⚙️ تشغيل الماكينة المركزية وسحب الحالات بـ "نقرة واحدة"
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useDashboard();

  // 📋 القائمة الموحدة لربط الشاشات مستقبلاً
  const navigationItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User },
    { id: 'tasks', name: 'المهام والأنشطة (Tasks & Activities)', icon: ClipboardList },
    { id: 'communication', name: 'مركز التواصل الذكي (Smart Communication)', icon: MessageSquare },
    { id: 'documents', name: 'الخطابات والوثائق (Official Documents)', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-right pb-32 relative overflow-hidden select-none" dir="rtl">
      
      {/* 🏛️ الهيدر العلوي - ثابت ومستقر */}
      <header className="pt-5 pb-3 px-5 flex items-center justify-between bg-[#f8f9fa] z-10">
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
          {/* زر المنيو لتشغيل الهوك وفتح القائمة الجانبية */}
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 active:scale-90 transition-transform">
            <Grid className="w-6 h-6 text-[#7A1C2E]" />
          </button>
        </div>
      </header>

      {/* 🧭 القائمة الجانبية الذكية المستدعاة من المجلد العام */}
      <SidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* 🎰 عرض المحتوى الديناميكي بناءً على حركة الهوك */}
      <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* 💳 كروت العرض الأفقية (المكون الخاص الأول) */}
              <EmergencyCards />

              {/* 📱 شبكة الخدمات الذكية (المكون الخاص الثاني) */}
              <BentoGrid />
            </motion.div>
          ) : (
            /* 🖥️ واجهة ديناميكية حية تعرض محتوى التبويب النشط فور نقره */
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

      {/* 🤖 مساعد غيث الذكي المستدعى من المجلد العام */}
      <GhaithButton onClick={() => setActiveTab('communication')} />

    </div>
  );
};

export default DashboardLayout;
