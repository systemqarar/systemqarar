import React from 'react';
import { Outlet } from 'react-router-dom';
import DeveloperSidebar from './DeveloperSidebar';
import { useAuth } from '../../../context/AuthContext';

const DeveloperLayout: React.FC = () => {
  const { user, logoutUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A1128] text-white flex font-sans">
      <DeveloperSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* الهيدر العلوي */}
        <header className="bg-[#111A35] border-b border-[#1E294B] h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-sm font-medium text-slate-300">نظام قرار | بيئة التطوير والتحكم بالسيستم</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">مرحباً يا باشمهندس</p>
              <p className="text-sm font-semibold text-[#C3073F]">{user?.username || 'المطور المحترف'}</p>
            </div>
            <button 
              onClick={logoutUser}
              className="bg-[#1E294B] hover:bg-[#C3073F] text-white text-xs px-3 py-2 rounded-lg transition-all duration-300"
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        {/* هنا تُعرض صفحات المطور المتغيرة */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0A1128] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DeveloperLayout;
