import { Bell, Menu, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [greeting, setGreeting] = useState('مرحباً بك يا قائد');

  // 🕒 حساب الترحيب الذكي تلقائياً بناءً على وقت جهاز المستخدم
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('صباح الخير والهمة يا قائد ☀️');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('نهارك سعيد وموفق يا قائد 🌤️');
    } else {
      setGreeting('مساء الخير والعطاء يا قائد ✨');
    }
  }, []);

  // 📅 جلب التاريخ الحالي بتنسيق عربي أنيق جداً
  const formattedDate = new Date().toLocaleDateString('ar-SD', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="pt-5 pb-3 px-5 flex items-center justify-between bg-[#f8f9fa] border-b border-gray-100 sticky top-0 z-20 backdrop-blur-md bg-[#f8f9fa]/90">
      
      {/* 🔸 اليمين: اللوقو المطور الفخم والترحيب الذكي بحالة الوقت والتاريخ */}
      <div className="flex items-center gap-3">
        {/* تصميم لوقو مؤقت فخم ومميز لنظام قرار يظهر كأنه ختم رسمي بظلال خفيفة */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#500C18] to-[#A3263D] flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-900/20 tracking-wider select-none border border-white/10">
          قرار
        </div>
        
        <div className="flex flex-col text-right">
          <span className="text-xs font-black text-slate-800 tracking-wide">{greeting}</span>
          <span className="text-[10px] text-gray-400 font-bold mt-0.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
            {formattedDate}
          </span>
        </div>
      </div>
      
      {/* 🔸 اليسار: الإشعارات المحدثة وأيقونة الثلاثة خطوط العالمية (Menu) */}
      <div className="flex items-center gap-3 text-slate-700">
        
        {/* زر الإشعارات المطور ببطانة بيضاء فخمة ونبضة ذكية */}
        <div className="relative p-2.5 rounded-xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-all cursor-pointer">
          <Bell className="w-4.5 h-4.5 text-slate-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#A3263D] rounded-full animate-pulse" />
        </div>
        
        {/* زر القائمة الجانبية المألوف (الثلاثة خطوط) بدلاً من الشبكة القديمة */}
        <button 
          onClick={onMenuClick} 
          className="p-2.5 rounded-xl bg-white shadow-sm border border-gray-100 active:scale-90 text-[#7A1C2E] transition-all"
        >
          <Menu className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
        
      </div>
    </header>
  );
};
