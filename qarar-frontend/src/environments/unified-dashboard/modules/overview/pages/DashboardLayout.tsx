import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Home, User, ClipboardList, MessageSquare, 
  FileText, Activity, ShieldAlert, Sparkles, Clock, ChevronLeft, Zap
} from 'lucide-react';

export const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('home');

  // إعدادات حركة الظهور التدريجي (Stagger Animation)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // 🌟 مكون الصفحة الرئيسية الفخم (لوحة القيادة)
  const HomeDashboard = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col gap-5 pb-8"
    >
      {/* الترحيب وحالة الذكاء الاصطناعي */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1 mt-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">مرحباً يا بطل،</h1>
        <p className="text-sm text-slate-500 font-medium">جاهز لإحداث فرق اليوم في الهلال الأحمر؟</p>
      </motion.div>

      {/* شريط حالة الذكاء الاصطناعي (غيث) */}
      <motion.div variants={itemVariants} 
        className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 shadow-lg shadow-slate-900/20 relative overflow-hidden flex items-center justify-between group cursor-pointer"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold">المساعد "غيث" نشط</h3>
            <p className="text-slate-300 text-[11px] mt-0.5">تم تحليل بيانات الطوارئ لمحيطك بنجاح.</p>
          </div>
        </div>
        <ChevronLeft className="w-5 h-5 text-slate-400 relative z-10 group-hover:-translate-x-1 transition-transform" />
      </motion.div>

      {/* الكروت الإحصائية السريعة (Glassmorphism) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Activity className="w-4 h-4" /></div>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+2 مهام</span>
          </div>
          <h4 className="text-2xl font-black text-slate-800 mt-2">14</h4>
          <p className="text-xs text-slate-400 font-medium mt-1">مهمة نشطة</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock className="w-4 h-4" /></div>
          </div>
          <h4 className="text-2xl font-black text-slate-800 mt-2">48h</h4>
          <p className="text-xs text-slate-400 font-medium mt-1">ساعات التطوع</p>
        </div>
      </motion.div>

      {/* أزرار الإجراءات السريعة الفخمة */}
      <motion.div variants={itemVariants} className="mt-2">
        <h3 className="text-sm font-bold text-slate-800 mb-3 px-1">إجراءات عاجلة</h3>
        <div className="grid grid-cols-2 gap-3">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-red-600 text-white rounded-2xl p-3.5 shadow-lg shadow-red-600/30 font-bold text-xs justify-center"
          >
            <ShieldAlert className="w-4 h-4" />
            إطلاق نداء طوارئ
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors rounded-2xl p-3.5 font-bold text-xs justify-center"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            تسجيل حضور
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans text-right pb-28 relative overflow-hidden select-none" dir="rtl">
      
      {/* 🏛️ شريط علوي نظيف ومحسن */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 10 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white font-black text-sm shadow-md"
          >
            ق
          </motion.div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">منظومة قرار</h2>
            <p className="text-[10px] text-red-600 font-bold">الهلال الأحمر</p>
          </div>
        </div>
        
        <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-slate-600 relative shadow-sm">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        </motion.button>
      </header>

      {/* 📄 متن الشاشة - هنا السحر يحدث */}
      <main className="flex-1 px-5 pt-6 overflow-y-auto">
        {activeTab === 'home' ? (
          <HomeDashboard />
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full mt-20"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {activeTab === 'profile' && 'الملف الشخصي'}
              {activeTab === 'tasks' && 'المهام والأنشطة'}
              {activeTab === 'ghaith' && 'مركز التواصل (غيث)'}
              {activeTab === 'docs' && 'الوثائق'}
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium text-center px-8">
              هذه الشاشة جاهزة لبرمجتها بنفس الاحترافية والفخامة.
            </p>
          </motion.div>
        )}
      </main>

      {/* 🧭 شريط التنقل السفلي الاحترافي - تم تحسين التوهج والانسيابية */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-md mx-auto bg-white/80 backdrop-blur-2xl border border-gray-100/50 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] z-50 p-1.5 flex justify-between items-center px-2">
        {[
          { id: 'home', name: 'الرئيسية', icon: Home },
          { id: 'profile', name: 'ملفي', icon: User },
          { id: 'tasks', name: 'المهام', icon: ClipboardList },
          { id: 'ghaith', name: 'غيث', icon: MessageSquare },
          { id: 'docs', name: 'وثائق', icon: FileText },
        ].map((tab) => {
          const isTabActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.85 }}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl transition-all duration-300 w-16"
            >
              {isTabActive && (
                <motion.div 
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-red-50 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <IconComponent 
                className={`w-[22px] h-[22px] transition-colors duration-300 ${
                  isTabActive ? 'stroke-[2.5] text-red-600' : 'stroke-[1.5] text-slate-400 hover:text-slate-600'
                }`} 
              />
              <span className={`text-[9px] mt-1 tracking-tight transition-all duration-300 ${
                isTabActive ? 'font-black text-red-600' : 'font-bold text-slate-400'
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
