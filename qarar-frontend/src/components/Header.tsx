import { Bell, Menu, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMenuClick: () => void;
}

export const Header = ({ activeTab, setActiveTab, onMenuClick }: HeaderProps) => {
  const [greeting, setGreeting] = useState('مرحباً بك يا قائد');

  // 🕒 حساب الترحيب الذكي تلقائياً بناءً على وقت جهاز المستخدم
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('صباح الخير والهمة ☀️');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('نهارك سعيد وموفق 🌤️');
    } else {
      setGreeting('مساء الخير والعطاء ✨');
    }
  }, []);

  // 📅 جلب التاريخ الحالي بتنسيق عربي أنيق جداً
  const formattedDate = new Date().toLocaleDateString('ar-SD', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // فحص إذا كنا في الشاشة الرئيسية أم صفحة فرعية
  const isMainPage = activeTab === 'overview';

  return (
    <header className="pt-5 pb-4 px-5 flex items-center justify-between bg-[#7A1C2E] text-white sticky top-0 z-20 shadow-md transition-all duration-300">
      
      {/* 🔹 اليمين: الأزرار الحركية الذكية + اللوقو الفخم والاسم */}
      <div className="flex items-center gap-3">
        
        {/* 🔄 الزر الديناميكي: منيو في الرئيسية، وسهم رجوع في الصفحات الفرعية لمنع العشوائية */}
        {isMainPage ? (
          <button 
            onClick={onMenuClick} 
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-white shadow-sm"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>
        ) : (
          <button 
            onClick={() => setActiveTab('overview')} 
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-90 transition-all text-white shadow-sm flex items-center justify-center animate-fadeIn"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* حاوية اللوقو الرسمي والاسم المطور */}
        <div className="flex items-center gap-2.5">
          {/* استدعاء اللوقو من مجلد public مباشرة ببطانة بيضاء لحمايته بصرياً */}
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-inner select-none">
            <img src="/logo.png" alt="شعار قرار" className="w-full h-full object-contain" />
          </div>
          
          <div className="flex flex-col text-right">
            <span className="text-xs font-black tracking-wide text-white">منظومة قرار</span>
            <span className="text-[9px] text-red-200/90 font-bold mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
      
      {/* 🔹 اليسار: الترحيب الذكي + جرس الإشعارات الفاخر */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-red-100 bg-white/10 px-2.5 py-1 rounded-lg hidden xs:inline-block">
          {greeting}
        </span>
        
        {/* زر الإشعارات بخلفية زجاجية داكنة متناسقة مع الكبدي */}
        <div className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer shadow-sm">
          <Bell className="w-4.5 h-4.5 text-white" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        </div>
      </div>

    </header>
  );
};
