import { Bell, Menu, ChevronRight, Sparkles, Home } from 'lucide-react'; // 🆕 استيراد أيقونة الهوم (البيت)
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 🆕 استيراد أدوات التوجيه الذكية لقراءة المسارات

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMenuClick: () => void;
}

export const Header = ({ activeTab, setActiveTab, onMenuClick }: HeaderProps) => {
  const [greeting, setGreeting] = useState('مرحباً بك يا قائد');
  const location = useLocation(); // 🗺️ لمعرفة المسار الحالي بدقة
  const navigate = useNavigate(); // 🚀 للتنقل الذكي بين الصفحات

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

  // 🔍 فحص ذكي ومقسّم لموقع المستخدم الحالي في المنظومة
  const isOverviewPage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const isProfileDashboard = location.pathname === '/dashboard/profile' || location.pathname === '/dashboard/profile/';
  const isDeepSubPage = !isOverviewPage && !isProfileDashboard; // صفحات عميقة (مثل البيانات الشخصية، الشهادات، إلخ)

  // ↩️ دالة التوجيه الديناميكية عند الضغط على سهم الرجوع
  const handleBackClick = () => {
    if (isDeepSubPage) {
      // لو في صفحة عميقة، يرجعه خطوة للخلف لصالة استقبال البروفايل
      navigate('/dashboard/profile');
    } else if (isProfileDashboard) {
      // لو في صالة البروفايل، يرجعه للوحة التحكم الرئيسية الخارجية
      setActiveTab('overview');
      navigate('/dashboard');
    }
  };

  return (
    <header className="pt-5 pb-4 px-5 flex items-center justify-between bg-[#7A1C2E] text-white sticky top-0 z-20 shadow-md transition-all duration-300">
      
      {/* 🔹 اليمين: الأزرار الحركية الذكية + اللوقو الفخم والاسم */}
      <div className="flex items-center gap-3">
        
        {/* 🔄 الزر الديناميكي الأول: منيو في الرئيسية، وسهم رجوع في أي صفحة أخرى */}
        {isOverviewPage ? (
          <button 
            onClick={onMenuClick} 
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-white shadow-sm"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>
        ) : (
          <button 
            onClick={handleBackClick} 
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-90 transition-all text-white shadow-sm flex items-center justify-center animate-fadeIn"
            title="رجوع للخلف"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* 🏠 الزر الخارق الإضافي (الهوم): يظهر "فقط" بجانب السهم عندما نكون داخل الصفحات العميقة */}
        {isDeepSubPage && (
          <button 
            onClick={() => {
              setActiveTab('overview');
              navigate('/dashboard');
            }} 
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-amber-300 border border-white/5 shadow-sm flex items-center justify-center animate-fadeIn"
            title="العودة للرئيسية مباشرة"
          >
            <Home className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* حاوية اللوقو الرسمي والاسم المطور */}
        <div className="flex items-center gap-2.5 mr-1">
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
        
        <div className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer shadow-sm">
          <Bell className="w-4.5 h-4.5 text-white" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        </div>
      </div>

    </header>
  );
};

export default Header;
