import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Home, User, ClipboardList, MessageSquare, FileText } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  // التبويب النشط للتحكم في التنقل وعرض اسم الصفحة فقط
  const [activeTab, setActiveTab] = useState('tasks');

  // دالة بسيطة لإرجاع اسم الصفحة الحالية بناءً على الزر المضغوط
  const getPageName = (tabId: string) => {
    switch (tabId) {
      case 'home': return 'الصفحة الرئيسية';
      case 'profile': return 'الملف الشخصي';
      case 'tasks': return 'المهام والأنشطة';
      case 'ghaith': return 'مركز التواصل';
      case 'docs': return 'الوثائق';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-right pb-28 relative overflow-hidden select-none" dir="rtl">
      
      {/* 🏛️ شريط علوي نظيف وبسيط جداً */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
            ق
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900">منظومة قرار</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-slate-400 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </div>
        </div>
      </header>

      {/* 📄 متن الشاشة: يعرض فقط اسم الصفحة المفتوحة بأعلى درجات النقاء البصري */}
      <main className="flex-1 flex items-center justify-center px-5">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            {getPageName(activeTab)}
          </h1>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            جاري استعراض الواجهة الهيكلية النظيفة لهذه الصفحة
          </p>
        </motion.div>
      </main>

      {/* 🧭 شريط التنقل السفلي الاحترافي - تركيز كامل على جمالية الأزرار وتفاعلها */}
      <nav className="fixed bottom-5 left-4 right-4 max-w-md mx-auto bg-white/90 backdrop-blur-lg border border-gray-100 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] z-40 p-1.5 flex justify-between items-center px-3">
        {[
          { id: 'home', name: 'الرئيسية', icon: Home },
          { id: 'profile', name: 'الملف الشخصي', icon: User },
          { id: 'tasks', name: 'المهام والأنشطة', icon: ClipboardList },
          { id: 'ghaith', name: 'مركز التواصل', icon: MessageSquare },
          { id: 'docs', name: 'الوثائق', icon: FileText },
        ].map((tab) => {
          const isTabActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-200 ${
                isTabActive 
                  ? 'text-red-600 font-black bg-red-50/60' 
                  : 'text-slate-400 font-bold hover:text-slate-600'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isTabActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              <span className="text-[9px] mt-1 tracking-tight">{tab.name}</span>
            </motion.button>
          );
        })}
      </nav>

    </div>
  );
};

export default DashboardLayout;
