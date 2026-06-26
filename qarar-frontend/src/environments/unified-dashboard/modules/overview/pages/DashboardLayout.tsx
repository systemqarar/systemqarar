import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Home, User, ClipboardList, MessageSquare, 
  Grid, Map, Radio, Ambulance, Users, Package, AlertTriangle, 
  Sparkles, ChevronLeft, Navigation, ShieldCheck
} from 'lucide-react';

export const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-right pb-32 relative overflow-hidden select-none" dir="rtl">
      
      {/* 🏛️ الهيدر العلوي - نفس روح تطبيق نسك */}
      <header className="pt-5 pb-3 px-5 flex items-center justify-between bg-[#f8f9fa] z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white text-slate-800 font-bold text-sm shadow-sm">
            ق
          </div>
          <span className="text-sm font-bold text-slate-800">محفظة قرار</span>
        </div>
        
        <div className="flex items-center gap-4 text-slate-700">
          <div className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#f8f9fa] rounded-full" />
          </div>
          <Grid className="w-6 h-6" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* 💳 الكروت الأفقية القابلة للتمرير (Horizontal Scroll) */}
        <div className="flex overflow-x-auto gap-3 px-5 pb-4 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="min-w-[260px] snap-center h-32 rounded-3xl bg-slate-900 relative overflow-hidden p-4 flex flex-col justify-end shadow-md">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="bg" />
            <div className="relative z-20">
              <h3 className="text-white font-black text-lg">تحليل البيانات</h3>
              <p className="text-gray-300 text-xs mt-1">الرصد الميداني اللحظي</p>
            </div>
          </div>

          <div className="min-w-[260px] snap-center h-32 rounded-3xl bg-slate-800 relative overflow-hidden p-4 flex items-center justify-center shadow-md">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="relative z-20 text-center">
              <h3 className="text-white font-black text-xl mb-2">نداء طوارئ</h3>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold py-1.5 px-4 rounded-full flex items-center gap-2 mx-auto">
                <ChevronLeft className="w-3 h-3" />
                استعد الآن
              </button>
            </div>
          </div>

        </div>

        {/* 🏷️ قسم اكتشف المزيد والتصنيفات */}
        <div className="px-5 mt-4">
          <p className="text-gray-400 text-xs mb-1">خدمات الميدان</p>
          <h2 className="text-2xl font-black text-slate-900 mb-4">اكتشف المزيد</h2>

          {/* تبويبات التصنيف (Pills) */}
          <div className="flex gap-2 mb-5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'all', label: 'الجميع', icon: Grid },
              { id: 'emergency', label: 'الطوارئ', icon: AlertTriangle },
              { id: 'logistics', label: 'اللوجستيات', icon: Package },
            ].map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-bold ${
                  activeCategory === cat.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-gray-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* 📱 شبكة الخدمات (Bento Grid) - نفس تخطيط نسك */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            
            {/* عمودين كروت صغيرة */}
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100">
                <Radio className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                <span className="text-[11px] font-bold text-slate-800 text-center">أجهزة الاتصال</span>
              </div>
              <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100 relative">
                <span className="absolute top-2 right-2 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full">قريباً</span>
                <Ambulance className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                <span className="text-[11px] font-bold text-slate-800 text-center">حركة الإسعاف</span>
              </div>
              <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100">
                <Home className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                <span className="text-[11px] font-bold text-slate-800 text-center">مراكز الإيواء</span>
              </div>
              <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100 relative">
                <span className="absolute top-2 right-2 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full">قريباً</span>
                <Navigation className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                <span className="text-[11px] font-bold text-slate-800 text-center">التوجيه</span>
              </div>
            </div>

            {/* كارت طولي (نفس فكرة كارت المطوف في نسك) */}
            <div className="col-span-1 bg-white rounded-3xl p-3 flex flex-col items-center justify-center shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-red-50 to-transparent" />
              <ShieldCheck className="w-12 h-12 text-red-600 mb-3 relative z-10 stroke-[1.5]" />
              <span className="text-xs font-black text-slate-800 text-center relative z-10">قائد الميدان</span>
            </div>

            {/* كروت سفلية عريضة */}
            <div className="col-span-2 bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <Map className="w-7 h-7 text-slate-700 stroke-[1.5]" />
                <span className="text-xs font-bold text-slate-800">خرائط الكوارث</span>
              </div>
            </div>
            
            <div className="col-span-1 bg-white rounded-3xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100">
              <Users className="w-7 h-7 text-slate-700 mb-1 stroke-[1.5]" />
              <span className="text-[10px] font-bold text-slate-800">المتطوعين</span>
            </div>

          </div>
        </div>
      </main>

      {/* 🤖 الزر العائم للذكاء الاصطناعي (مساعد غيث) - مستوحى من نسك AI */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          className="w-full bg-slate-900 text-white rounded-full p-1 pl-4 flex items-center justify-between shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
        >
          <div className="bg-white text-slate-900 text-xs font-black py-2.5 px-5 rounded-full">
            اسأل مساعدك غيث
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </div>
        </motion.button>
      </div>

      {/* 🧭 شريط التنقل السفلي - نظيف جداً بخلفية بيضاء صريحة */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 px-6 py-2 flex justify-between items-center pb-safe">
        {[
          { id: 'home', name: 'الرئيسية', icon: Home },
          { id: 'tasks', name: 'المهام', icon: ClipboardList },
          { id: 'ghaith', name: 'غيث', icon: MessageSquare },
          { id: 'profile', name: 'حسابي', icon: User },
        ].map((tab) => {
          const isTabActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center py-2 min-w-[60px]"
            >
              <IconComponent 
                className={`w-6 h-6 mb-1 transition-all ${
                  isTabActive ? 'stroke-[2.5] text-slate-900' : 'stroke-[1.5] text-gray-400'
                }`} 
              />
              <span className={`text-[10px] transition-all ${
                isTabActive ? 'font-black text-slate-900' : 'font-semibold text-gray-400'
              }`}>
                {tab.name}
              </span>
            </motion.button>
          );
        })}
      </nav>

    </div>
  );
};

export default DashboardLayout;
