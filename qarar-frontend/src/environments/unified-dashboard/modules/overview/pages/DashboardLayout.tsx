import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Home, User, ClipboardList, MessageSquare, FileText, X,
  Grid, Map, Radio, Ambulance, Users, Package, AlertTriangle, 
  Sparkles, ChevronLeft, Navigation, ShieldCheck
} from 'lucide-react';

export const DashboardLayout = () => {
  // الحالات التفاعلية للنظام
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 📋 الهيكلية الموحدة والمستقلة لأزرار التنقل (تعديل سطر واحد هنا يغير السيستم بالكامل)
  const navigationItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User },
    { id: 'tasks', name: 'المهام والأنشطة (Tasks & Activities)', icon: ClipboardList },
    { id: 'communication', name: 'مركز التواصل الذكي (Smart Communication)', icon: MessageSquare },
    { id: 'documents', name: 'الخطابات والوثائق (Official Documents)', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-right pb-32 relative overflow-hidden select-none" dir="rtl">
      
      {/* 🏛️ الهيدر العلوي - متناسق مع الهوية الجديدة */}
      <header className="pt-5 pb-3 px-5 flex items-center justify-between bg-[#f8f9fa] z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-red-100 flex items-center justify-center bg-white text-[#7A1C2E] font-black text-sm shadow-sm">
            ق
          </div>
          <span className="text-sm font-bold text-slate-800">محفظة قرار</span>
        </div>
        
        <div className="flex items-center gap-4 text-slate-700">
          <div className="relative cursor-pointer">
            <Bell className="w-6 h-6 text-slate-700" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#7A1C2E] border-2 border-[#f8f9fa] rounded-full" />
          </div>
          {/* زر المنيو (المربعات) لفتح القائمة الجانبية بنقرة صباع */}
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 active:scale-90 transition-transform">
            <Grid className="w-6 h-6 text-[#7A1C2E]" />
          </button>
        </div>
      </header>

      {/* 🧭 القائمة الجانبية الذكية المخصصة للموبايل (Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* الخلفية المظلمة الشفافة عند فتح القائمة */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />

            {/* جسم القائمة المنزلق باللون الكبدي الملكي */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80vw] max-w-xs bg-[#7A1C2E] z-50 shadow-2xl p-6 flex flex-col justify-between text-white"
            >
              <div>
                {/* رأس القائمة وزر الإغلاق */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white text-[#7A1C2E] flex items-center justify-center font-black text-xs">
                      ق
                    </div>
                    <span className="font-bold text-sm">نظام قرار الإداري</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-full bg-white/10 active:scale-95">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* عرض الأزرار الخمسة تفاعلياً */}
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const isSelected = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false); // إغلاق تلقائي بعد الاختيار لراحة المستخدم
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-right transition-all text-sm font-medium ${
                          isSelected 
                            ? 'bg-white text-[#7A1C2E] font-bold shadow-lg shadow-black/10' 
                            : 'hover:bg-white/5 text-white/80'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* تذييل القائمة الجانبية */}
              <div className="text-xs text-white/40 text-center border-t border-white/10 pt-4">
                وحدة الوحدة الإدارية
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🎰 عرض المحتوى الديناميكي بناءً على الزر النشط */}
      <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* 💳 كروت العرض الأفقية باللون الكبدي الجديد */}
              <div className="flex overflow-x-auto gap-3 px-5 pb-4 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                <div className="min-w-[260px] snap-center h-32 rounded-3xl bg-[#7A1C2E] relative overflow-hidden p-4 flex flex-col justify-end shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="bg" />
                  <div className="relative z-20">
                    <h3 className="text-white font-black text-lg">تحليل البيانات</h3>
                    <p className="text-red-200 text-xs mt-1">الرصد الميداني اللحظي</p>
                  </div>
                </div>

                <div className="min-w-[260px] snap-center h-32 rounded-3xl bg-[#8C2337] relative overflow-hidden p-4 flex items-center justify-center shadow-md">
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

              {/* 🏷️ قسم اكتشف المزيد والشبكة */}
              <div className="px-5 mt-4">
                <p className="text-gray-400 text-xs mb-1">خدمات الميدان</p>
                <h2 className="text-2xl font-black text-slate-900 mb-4">اكتشف المزيد</h2>

                {/* تبويبات التصنيف (Pills) باللون الجديد */}
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
                          ? 'bg-[#7A1C2E] text-white shadow-md' 
                          : 'bg-white text-slate-600 border border-gray-200'
                      }`}
                    >
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* 📱 شبكة الخدمات (Bento Grid) المحدثة باللمسات الكبدية */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100">
                      <Radio className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                      <span className="text-[11px] font-bold text-slate-800 text-center">أجهزة الاتصال</span>
                    </div>
                    <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100 relative">
                      <span className="absolute top-2 right-2 bg-red-50 text-[#7A1C2E] text-[9px] font-bold px-2 py-0.5 rounded-full">قريباً</span>
                      <Ambulance className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                      <span className="text-[11px] font-bold text-slate-800 text-center">حركة الإسعاف</span>
                    </div>
                    <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100">
                      <Home className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                      <span className="text-[11px] font-bold text-slate-800 text-center">مراكز الإيواء</span>
                    </div>
                    <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100 relative">
                      <span className="absolute top-2 right-2 bg-red-50 text-[#7A1C2E] text-[9px] font-bold px-2 py-0.5 rounded-full">قريباً</span>
                      <Navigation className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
                      <span className="text-[11px] font-bold text-slate-800 text-center">التوجيه</span>
                    </div>
                  </div>

                  {/* كارت قائد الميدان باللون الملكي */}
                  <div className="col-span-1 bg-white rounded-3xl p-3 flex flex-col items-center justify-center shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-red-50 to-transparent" />
                    <ShieldCheck className="w-12 h-12 text-[#7A1C2E] mb-3 relative z-10 stroke-[1.5]" />
                    <span className="text-xs font-black text-slate-800 text-center relative z-10">قائد الميدان</span>
                  </div>

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
            </motion.div>
          ) : (
            /* 🖥️ واجهة ديناميكية حية تعرض محتوى التبويب النشط فور نقره */
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-5 mt-6"
            >
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center">
                {(() => {
                  const item = navigationItems.find(n => n.id === activeTab);
                  const Icon = item?.icon || Home;
                  return (
                    <>
                      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-[#7A1C2E]">
                        <Icon className="w-8 h-8 stroke-[1.5]" />
                      </div>
                      <h2 className="text-xl font-black text-slate-900 mb-2">{item?.name}</h2>
                      <p className="text-gray-400 text-sm max-w-xs">
                        تم تفعيل واجهة {item?.name} بنجاح. هنا سيتم ربط ومعالجة البيانات الخاصة بهذا القسم بشكل مستقل.
                      </p>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🤖 مساعد غيث الذكي المطور باللون الملكي الجديد */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#7A1C2E] text-white rounded-full p-1 pl-4 flex items-center justify-between shadow-[0_10px_25px_rgba(122,28,46,0.25)]"
        >
          <div className="bg-white text-[#7A1C2E] text-xs font-black py-2.5 px-5 rounded-full">
            اسأل مساعدك غيث
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <ChevronLeft className="w-5 h-5 text-red-200" />
          </div>
        </motion.button>
      </div>

    </div>
  );
};

export default DashboardLayout;
