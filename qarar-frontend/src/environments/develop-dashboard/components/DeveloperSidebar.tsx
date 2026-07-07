import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DeveloperSidebar: React.FC = () => {
  const location = useLocation();

  // اختبار الصفحة الحالية لتلوين الأزرار حسب التوجيه النشط
  const isOverviewActive = location.pathname === '/developer' || location.pathname === '/developer/';
  const isMonitoringActive = location.pathname.includes('/developer/monitoring');

  return (
    <div className="w-64 h-screen bg-[#0A1128] border-e border-[#1E294B] flex flex-col p-4 select-none" dir="rtl">
      
      {/* شعار البيئة التطويرية لمنظومة قرار */}
      <div className="flex items-center gap-2 px-2 py-4 mb-6 border-b border-[#1E294B]/40">
        <span className="text-xl font-black text-white tracking-wider">QARAR</span>
        <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">DEV</span>
      </div>

      {/* القائمة والروابط */}
      <div className="flex-1 space-y-6">
        <div>
          <Link
            to="/developer"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
              isOverviewActive
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'text-slate-400 hover:bg-[#111A35] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>اللوحة الرئيسية للمطور</span>
          </Link>
        </div>

        {/* أدوات النظام المتقدمة */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 px-2 tracking-wide">أدوات النظام</p>
          
          {/* تفعيل زر مراقبة السيرفر والـ Logs بنجاح */}
          <Link
            to="/developer/monitoring"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
              isMonitoringActive
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'text-slate-400 hover:bg-[#111A35] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Logs مراقبة السيرفر والـ</span>
          </Link>

          {/* خيار تعديل المناصب - معطل لحين برمجته مستقبلاً */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs text-slate-600 cursor-not-allowed select-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>منح وتعديل مناصب الأعضاء</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSidebar;
