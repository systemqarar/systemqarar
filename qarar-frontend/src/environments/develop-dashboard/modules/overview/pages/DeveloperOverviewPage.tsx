import React from 'react';

const DeveloperOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6" dir="rtl">
      
      {/* 1. بنر الترحيب الفخم (غرفة التحكم) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#111A35] via-[#15224F] to-[#1E294B] p-6 rounded-2xl border border-[#1E294B] shadow-2xl shadow-black/20">
        {/* لمسة دراماتيكية خلفية مضيئة خفيفة */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-[#38BDF8]/10 text-[#38BDF8] px-2.5 py-0.5 rounded-full font-bold border border-[#38BDF8]/20">نشط الآن</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">أهلاً بك في غرفة التحكم المركزية</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              هذه البيئة مخصصة لك بالكامل لمتابعة البنية التحتية للمنظومة، إدارة قواعد البيانات، وتوزيع الصلاحيات الإدارية والمناصب للأعضاء بأعلى معايير الأمان.
            </p>
          </div>
          
          {/* أيقونة الترس البرمجية الكبيرة */}
          <div className="text-[#38BDF8] bg-[#38BDF8]/5 p-3 rounded-xl border border-[#38BDF8]/10 self-start sm:self-center">
            <svg className="w-8 h-8 animate-[spin_8s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. كروت المؤشرات الحيوية (الموازية لكروت الداشبورد الأساسي) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* كرت حالة السيرفر */}
        <div className="bg-[#111A35] p-5 rounded-2xl border border-[#1E294B] flex flex-col justify-between hover:border-[#38BDF8]/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">حالة اتصال السيرفر</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse"></div>
          </div>
          <div className="my-4">
            <h3 className="text-xl font-bold text-emerald-400 group-hover:scale-[1.01] transition-transform origin-right">متصل (Online)</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 border-t border-[#1E294B]/50 pt-3 mt-1">
            <svg className="w-3.5 h-3.5 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>استجابة الـ API مستقرة وآمنة</span>
          </div>
        </div>

        {/* كرت قاعدة البيانات */}
        <div className="bg-[#111A35] p-5 rounded-2xl border border-[#1E294B] flex flex-col justify-between hover:border-[#38BDF8]/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">قاعدة البيانات والنسخ</span>
            <svg className="w-4 h-4 text-blue-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div className="my-4">
            <h3 className="text-xl font-bold text-blue-400 group-hover:scale-[1.01] transition-transform origin-right">مؤمنة ومزامنة</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 border-t border-[#1E294B]/50 pt-3 mt-1">
            <svg className="w-3.5 h-3.5 text-blue-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>آخر نسخة احتياطية: تلقائية ومستمرة</span>
          </div>
        </div>

        {/* كرت رتبة الحساب المطور */}
        <div className="bg-[#111A35] p-5 rounded-2xl border border-[#1E294B] flex flex-col justify-between hover:border-[#38BDF8]/30 transition-all duration-300 group sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">صلاحيات الحساب الحالي</span>
            <span className="text-[10px] bg-[#38BDF8]/10 text-[#38BDF8] px-2 py-0.5 rounded font-mono font-bold">Root</span>
          </div>
          <div className="my-4">
            <h3 className="text-xl font-bold text-[#38BDF8] tracking-wide group-hover:scale-[1.01] transition-transform origin-right">Super Admin</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 border-t border-[#1E294B]/50 pt-3 mt-1">
            <svg className="w-3.5 h-3.5 text-[#38BDF8]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>كامل الصلاحيات البرمجية والإدارية مفتوحة</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeveloperOverviewPage;
