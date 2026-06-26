import React, { useState } from 'react';

export default function DashboardLayout() {
  // حالة تتبع الصفحة الحالية المفتوحة
  const [activeTab, setActiveTab] = useState('overview');
  // حالة تتبع فتح قائمة التنبيهات الإدارية
  const [showNotifications, setShowNotifications] = useState(false);

  // دالة مساعدة لعرض محتوى الصفحة المحددة بكلام رسمي ونظيف
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-white">اللوحة العامة للمنظومة</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              مرحباً بك في نظام قرار. تستعرض هذه الشاشة ملخصاً سريعاً لأداء الوحدة الإدارية، وتنبيهات اليوم، والمؤشرات العامة للعمل الميداني.
            </p>
            {/* كبسولة زجاجية تفاعلية كمثال للمحتوى المستقبلي */}
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl mt-4">
              <span className="text-xs text-red-400 font-medium bg-red-500/10 px-2.5 py-1 rounded-full">تحديث عاجل</span>
              <h3 className="text-lg font-semibold text-white mt-2">جاهزية غرفة العمليات</h3>
              <p className="text-gray-400 text-xs mt-1">جميع قنوات الاتصال والتحقق الآمن تعمل الآن بكفاءة عالية على مدار الساعة.</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-white">الملف الشخصي والبطاقة الرقمية</h2>
            <p className="text-gray-300 text-sm">
              هنا تظهر بياناتك الإدارية المعتمدة لدى الوحدة، وتفاصيل المنصب، بالإضافة إلى بطاقة الهوية الرقمية الذكية الخاصة بالتحقق الميداني.
            </p>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-white">المهام والأنشطة الميدانية</h2>
            <p className="text-gray-300 text-sm">
              جدول المتابعة الشامل للتكليفات الموكلة إليك من قبل إدارة السبعة مكاتب، مع إمكانية رفع التقارير الدورية فور إنجاز العمل الميداني.
            </p>
          </div>
        );
      case 'communication':
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-white">مركز التواصل الذكي</h2>
            <p className="text-gray-300 text-sm">
              منصة الاتصال المتكاملة للوحدة؛ تشمل غرف المحادثات الجماعية للمكاتب الإدارية، وبوابة الاجتماعات الآلية المدارة بالكامل عبر المساعد الذكي.
            </p>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-white">الخطابات والوثائق الرسمية</h2>
            <p className="text-gray-300 text-sm">
              قسم إصدار وتوليد التكليفات والخطابات الإدارية الرسمية بختم ومستندات الوحدة المعتمدة، مع إمكانية حفظها وتحميلها بصيغة المستندات القياسية.
            </p>
          </div>
        );
      default:
        return <h2 className="text-xl font-bold text-white">اللوحة العامة للمنظومة</h2>;
    }
  };

  return (
    // الخلفية الكحلية الملكية العميقة للنظام بالكامل مع الحفاظ على راحة العين بالجوال
    <div className="min-h-screen bg-[#0A1128] text-white font-sans flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* 👑 الزخرفة الشفافة الذكية في الخلفية لإعطاء حيوية دون تشتيت (3% شفافية) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C3073F_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* 🗺️ الشريط العلوي (Topbar) - شريط الحالة والوصول السريع */}
      <header className="w-full bg-[#0F1C3F]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center space-x-2 space-x-reverse">
          {/* هالة دائرية صغيرة ترمز للمنظومة */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C3073F] to-[#0A1128] flex items-center justify-center border border-white/20 shadow-md">
            <span className="text-xs font-bold text-white">ق</span>
          </div>
          <h1 className="text-base font-bold tracking-wide text-white">منظومة قرار</h1>
        </div>

        {/* أدوات الإشعارات والمساعد السريع في الجوال */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* 🤖 زر غيث الخاطف والمبادر (محاط بنبض خفيف يعبر عن الجهوزية) */}
          <button 
            onClick={() => setActiveTab('communication')}
            className="relative p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 active:scale-95 transition-all shadow-inner"
            title="المساعد الذكي غيث"
          >
            <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          {/* 🔔 أيقونة التنبيهات الإدارية */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 active:scale-95 transition-all relative"
          >
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#C3073F] rounded-full"></span>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* 📳 قائمة التنبيهات المنسدلة للجوال عند الضغط عليها */}
      {showNotifications && (
        <div className="absolute top-14 left-4 right-4 bg-[#0F1C3F] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn backdrop-blur-lg">
          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
            <span className="text-xs font-bold text-gray-300">التنبيهات الإدارية الأخيرة</span>
            <button onClick={() => setShowNotifications(false)} className="text-gray-400 text-xs hover:text-white">إغلاق</button>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-white/5 rounded-lg text-xs border-r-2 border-[#C3073F]">
              <p className="text-white font-medium">تم اعتماد ربط قاعدة بيانات حصر بنجاح.</p>
              <span className="text-gray-400 text-[10px] block mt-1">منذ دقيقة</span>
            </div>
          </div>
        </div>
      )}

      {/* 📱 ساحة العرض الرئيسية (Main Content) - متحركة حسب الزر المختار */}
      <main className="flex-grow p-4 pb-24 overflow-y-auto z-10">
        {renderContent()}
      </main>

      {/* 🧭 القائمة السفلية المرنة المخصصة للجوال (The Royal Bottom Navigation) */}
      <nav className="w-[calc(100%-2rem)] mx-4 bg-[#0F1C3F]/90 backdrop-blur-lg border border-white/10 rounded-2xl h-16 fixed bottom-4 left-0 right-0 z-40 flex justify-around items-center px-2 shadow-2xl shadow-black/50">
        
        {/* زر الرئيسية */}
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center flex-grow h-full rounded-xl transition-all ${activeTab === 'overview' ? 'text-[#C3073F] bg-white/5' : 'text-gray-400 hover:text-white'}`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">الرئيسية</span>
        </button>

        {/* زر البروفايل */}
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center flex-grow h-full rounded-xl transition-all ${activeTab === 'profile' ? 'text-[#C3073F] bg-white/5' : 'text-gray-400 hover:text-white'}`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">الملف الشخصي</span>
        </button>

        {/* زر المهام والأنشطة */}
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center justify-center flex-grow h-full rounded-xl transition-all ${activeTab === 'tasks' ? 'text-[#C3073F] bg-white/5' : 'text-gray-400 hover:text-white'}`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-[10px] font-medium">المهام والأنشطة</span>
        </button>

        {/* زر مركز التواصل */}
        <button 
          onClick={() => setActiveTab('communication')}
          className={`flex flex-col items-center justify-center flex-grow h-full rounded-xl transition-all ${activeTab === 'communication' ? 'text-[#C3073F] bg-white/5' : 'text-gray-400 hover:text-white'}`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[10px] font-medium">مركز التواصل</span>
        </button>

        {/* زر الخطابات والوثائق */}
        <button 
          onClick={() => setActiveTab('documents')}
          className={`flex flex-col items-center justify-center flex-grow h-full rounded-xl transition-all ${activeTab === 'documents' ? 'text-[#C3073F] bg-white/5' : 'text-gray-400 hover:text-white'}`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] font-medium">الوثائق</span>
        </button>

      </nav>
    </div>
  );
}
 