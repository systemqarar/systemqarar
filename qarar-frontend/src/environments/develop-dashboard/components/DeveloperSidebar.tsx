import React from 'react';
import { NavLink } from 'react-router-dom';

const DeveloperSidebar: React.FC = () => {
  return (
    <aside className="w-full h-full bg-[#111A35] flex flex-col justify-between" dir="rtl">
      <div>
        {/* الشعار العلوي - بيئة المطور */}
        <div className="h-16 flex items-center justify-center border-b border-[#1E294B] bg-[#0A1128] px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wider text-white">QARAR</span>
            <span className="text-[10px] bg-[#38BDF8]/10 text-[#38BDF8] px-2 py-0.5 rounded font-mono font-bold border border-[#38BDF8]/20">DEV</span>
          </div>
        </div>

        {/* روابط التنقل المضيئة */}
        <nav className="p-4 space-y-2">
          <NavLink
            to="/developer"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-white text-[#0A1128] font-bold shadow-xl shadow-white/5' 
                  : 'text-slate-400 hover:bg-[#1E294B] hover:text-slate-200'
              }`
            }
          >
            {/* أيقونة الداشبورد الاحترافية SVG */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            <span>اللوحة الرئيسية للمطور</span>
          </NavLink>

          {/* أدوات النظام القادمة (محسنة التباين والهيكل) */}
          <div className="pt-4 border-t border-[#1E294B] mt-4">
            <p className="text-[10px] text-slate-400 font-bold px-4 mb-3 uppercase tracking-wider opacity-60">أدوات النظام القادمة</p>
            
            {/* كرت مراقبة السيرفر */}
            <div className="flex items-center justify-between px-4 py-3 text-slate-500 rounded-xl text-sm cursor-not-allowed select-none bg-[#0A1128]/40 border border-[#1E294B]/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">مراقبة السيرفر والـ Logs</span>
              </div>
              <span className="text-[9px] bg-[#1E294B] text-slate-400 px-2 py-0.5 rounded-md font-medium">قريباً</span>
            </div>

            {/* كرت الصلاحيات والمناصب */}
            <div className="flex items-center justify-between px-4 py-3 text-slate-500 rounded-xl text-sm cursor-not-allowed select-none bg-[#0A1128]/40 border border-[#1E294B]/30 transition-all duration-300 mt-2">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 11-7.743-5.743L11 5H6a2 2 0 00-2 2v3a1 1 0 001 1h1v1a1 1 0 001 1h1v1a1 1 0 001 1h3a2 2 0 002-2v-1.586l4.743-4.743A2 2 0 0121 9z" />
                </svg>
                <span className="text-xs">منح وتعديل مناصب الأعضاء</span>
              </div>
              <span className="text-[9px] bg-[#1E294B] text-slate-400 px-2 py-0.5 rounded-md font-medium">قريباً</span>
            </div>
          </div>
        </nav>
      </div>

      {/* الفوتر السفلي للمحرك */}
      <div className="p-4 border-t border-[#1E294B] text-center bg-[#0A1128]">
        <p className="text-[10px] text-slate-400 font-mono opacity-60 tracking-wide">Qarar System Engine v2.0</p>
      </div>
    </aside>
  );
};

export default DeveloperSidebar;
