import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DeveloperSidebar from './DeveloperSidebar';
import { useAuth } from '../../../context/AuthContext';

const DeveloperLayout: React.FC = () => {
  const { user, logoutUser } = useAuth();
  // State للتحكم في القائمة الجانبية على الموبايل
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1128] text-white flex font-sans relative overflow-x-hidden" dir="rtl">
      
      {/* 1. القائمة الجانبية (Responsive Sidebar) */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-64 transform bg-[#111A35] border-l border-[#1E294B] transition-transform duration-300 ease-in-out 
          md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* مررنا دالة الإغلاق للـ Sidebar عشان لو داير تعمل زر إغلاق جواه */}
        <DeveloperSidebar /> 
      </div>

      {/* 2. غطاء خلفي (Backdrop) عند فتح القائمة في الموبايل */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* 3. منطقة المحتوى الرئيسية */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* الهيدر العلوي */}
        <header className="bg-[#111A35] border-b border-[#1E294B] h-16 flex items-center justify-between px-4 md:px-6 z-30">
          
          <div className="flex items-center gap-3">
            {/* زر الهامبرغر (☰) يظهر في الموبايل فقط */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -mr-2 text-slate-300 hover:text-white rounded-lg hover:bg-[#1E294B] md:hidden transition-colors"
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block"></span>
            <h1 className="text-xs sm:text-sm font-medium text-slate-300">
              نظام قرار <span className="text-[#38BDF8] font-bold mx-1">DEV</span> | غرفة التحكم المركزية
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400">مرحباً يا باشمهندس</p>
              <p className="text-xs font-semibold text-[#38BDF8]">{user?.username || 'لؤي جعفر'}</p>
            </div>
            
            <button 
              onClick={logoutUser}
              className="bg-[#1E294B] hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/50 border border-transparent text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-300"
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        {/* هنا تُعرض صفحات المطور المتغيرة (Overview) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0A1128] p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default DeveloperLayout;
