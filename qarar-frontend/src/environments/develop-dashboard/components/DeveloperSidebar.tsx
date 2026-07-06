import React from 'react';
import { NavLink } from 'react-router-dom';

const DeveloperSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#111A35] border-l border-[#1E294B] flex flex-col h-screen">
      {/* الشعار العلوي */}
      <div className="h-16 flex items-center justify-center border-b border-[#1E294B] bg-[#0A1128]">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-wider text-[#C3073F]">QARAR</span>
          <span className="text-[10px] bg-[#C3073F]/20 text-[#C3073F] px-2 py-0.5 rounded font-mono">DEV</span>
        </div>
      </div>

      {/* روابط التنقل */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink
          to="/developer"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
              isActive 
                ? 'bg-[#C3073F] text-white font-semibold shadow-lg shadow-[#C3073F]/20' 
                : 'text-slate-400 hover:bg-[#1E294B] hover:text-white'
            }`
          }
        >
          <span>📊</span>
          <span>اللوحة الرئيسية للمطور</span>
        </NavLink>

        {/* أدوات معطلة مؤقتاً للمستقبل */}
        <div className="pt-4 border-t border-[#1E294B] mt-4">
          <p className="text-[10px] text-slate-500 font-bold px-4 mb-2 uppercase tracking-wider">أدوات النظام القادمة</p>
          
          <div className="flex items-center gap-3 px-4 py-3 text-slate-600 text-sm cursor-not-allowed opacity-50">
            <span>🖥️</span>
            <span>مراقبة السيرفر والـ Logs</span>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 text-slate-600 text-sm cursor-not-allowed opacity-50">
            <span>🔑</span>
            <span>منح وتعديل مناصب الأعضاء</span>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-[#1E294B] text-center bg-[#0A1128]">
        <p className="text-[10px] text-slate-500 font-mono">Qarar System Engine v2.0</p>
      </div>
    </aside>
  );
};

export default DeveloperSidebar;
