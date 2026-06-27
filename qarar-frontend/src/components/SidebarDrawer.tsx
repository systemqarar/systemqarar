import { motion } from 'framer-motion';
import { X, Home, User, ClipboardList, MessageSquare, FileText, LogOut, Sparkles } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarDrawer = ({ isOpen, onClose, activeTab, setActiveTab }: SidebarDrawerProps) => {
  
  // 📝 هيكل البيانات النظيف: أضفنا البادج الذكي (badge) لكل خيار لتحديد الأنظمة الحية
  const menuItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User },
    { 
      id: 'tasks', 
      name: 'المهام والأنشطة', 
      icon: ClipboardList, 
      badge: { text: '٣ نشطة', type: 'info' } 
    },
    { 
      id: 'communication', 
      name: 'مركز التواصل الذكي', 
      icon: MessageSquare, 
      badge: { text: 'جاري إدارة الاجتماع', type: 'ai' } // مؤشر الذكاء الاصطناعي الخاص بـ Gemini
    },
    { id: 'documents', name: 'الخطابات والوثائق', icon: FileText },
  ];

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      
      {/* 🌑 الخلفية المظلمة الشفافة مع تحسين الضبابية */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      {/* 🎪 جسم القائمة المنزلق المزخرف */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 260 }}
        className="absolute top-0 right-0 h-full w-[85vw] max-w-xs text-white p-6 flex flex-col justify-between shadow-2xl overflow-hidden bg-gradient-to-br from-[#400A13] via-[#7A1C2E] to-[#911F34]"
      >
        
        {/* 🎨 طبقة الزخارف الخلفية الذكية */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-red-400/20 blur-3xl"
          />
          <motion.div 
            animate={{ scale: [1.15, 1, 1.15], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        {/* 🏛️ المحتوى الأمامي */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            {/* هيدر المنيو الذكي */}
            <div className="flex justify-between items-center mb-6 border-b border-white/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#7A1C2E] font-black text-sm shadow-md ring-4 ring-white/10">
                  ق
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-wide">نظام قرار الذكي</span>
                  <span className="text-[10px] text-red-200/70 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" /> لوحة المشرف العام
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 🧭 الأزرار التفاعلية الحية */}
            <motion.nav 
              animate={isOpen ? "open" : "closed"}
              variants={{
                open: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                closed: {}
              }}
              className="space-y-1.5"
            >
              {menuItems.map((item) => {
                const IsActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    variants={{
                      open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
                      closed: { opacity: 0, y: 12 }
                    }}
                    whileHover={{ x: -4 }} // حركة انزياح خفيفة لليسار (بحكم أن القائمة عربية وتبدأ من اليمين)
                    whileTap={{ scale: 0.97 }} // إحساس الضغط الفيزيائي الممتع للموبايل
                    onClick={() => {
                      setActiveTab(item.id);
                      setTimeout(onClose, 150);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs relative select-none cursor-pointer transition-colors ${
                      IsActive ? 'text-[#7A1C2E]' : 'text-red-100 hover:bg-white/5'
                    }`}
                  >
                    {/* خلفية الزر النشط الانسيابية السحرية */}
                    {IsActive && (
                      <motion.div
                        layoutId="royalActiveBg"
                        className="absolute inset-0 bg-white rounded-xl z-0 shadow-lg shadow-black/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    
                    {/* محتوى محاذاة اليمين (الأيقونة والنص) */}
                    <span className="relative z-10 flex items-center gap-3">
                      <motion.span
                        animate={{ scale: IsActive ? 1.12 : 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <item.icon className={`w-4.5 h-4.5 ${IsActive ? 'stroke-[2.5] text-[#7A1C2E]' : 'stroke-[1.5] text-red-200/80'}`} />
                      </motion.span>
                      <span>{item.name}</span>
                    </span>

                    {/* محتوى محاذاة اليسار (البادجات والأنظمة الذكية الحية) */}
                    {item.badge && (
                      <span className="relative z-10">
                        {item.badge.type === 'ai' ? (
                          <span className="flex items-center gap-1 text-[9px] bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            {item.badge.text}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded-full font-medium">
                            {item.badge.text}
                          </span>
                        )}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.nav>
          </div>

          {/* زر تسجيل الخروج السفلي المطور */}
          <div className="border-t border-white/10 pt-4">
            <motion.button 
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-xs bg-white/5 text-red-200 hover:bg-white/10 active:scale-98 transition-all border border-white/5 shadow-inner"
            >
              <LogOut className="w-4.5 h-4.5 text-red-300" />
              تسجيل الخروج من النظام
            </motion.button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
