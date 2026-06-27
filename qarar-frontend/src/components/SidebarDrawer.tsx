import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, User, ClipboardList, MessageSquare, FileText, LogOut, Sparkles } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarDrawer = ({ isOpen, onClose, activeTab, setActiveTab }: SidebarDrawerProps) => {
  
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
      badge: { text: 'جاري إدارة الاجتماع', type: 'ai' }
    },
    { id: 'documents', name: 'الخطابات والوثائق', icon: FileText },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-start p-4" dir="rtl">
          
          {/* 🌑 الخلفية المظلمة الشفافة: تم تخفيف الـ Blur لتوفير طاقة المعالج أثناء الحركة */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-[4px] transition-all"
          />

          {/* 🎪 جسم القائمة العائم (Floating Deck Panel) */}
          <motion.div 
            initial={{ x: '110%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '110%', opacity: 0.9 }}
            /* تم ضبط التوقيت هنا ليكون Tween انسيابي وسريع جداً مقتبس من حركات نظام iOS */
            transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.38 }}
            style={{ willChange: 'transform' }} // إجبار الموبايل على تشغيل كرت الشاشة لقوة الأداء
            className="relative h-[calc(100vh-2rem)] w-[85vw] max-w-[290px] text-white p-5 flex flex-col justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#560E1A] via-[#7A1C2E] to-[#400A13] rounded-[2rem] border border-white/10 overflow-hidden z-10"
          >
            
            {/* 🎨 شبكة الخطوط الهندسية الفخمة الثابتة في الخلفية بدون حركات متعبة */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />

            {/* 🏛️ المحتوى الأمامي */}
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                {/* هيدر المنيو الموحد باللوقو الرسمي الجديد */}
                <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    {/* استدعاء اللوقو الفخم من الـ public مباشرة */}
                    <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md select-none">
                      <img src="/logo.png" alt="قرار" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-xs tracking-wide">نظام قرار الذكي</span>
                      <span className="text-[9px] text-red-200/70 flex items-center gap-1 font-bold mt-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" /> لوحة المشرف العام
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={onClose} 
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5 text-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 🧭 الأزرار التفاعلية الطائرة */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const IsActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setTimeout(onClose, 120); // تأخير خفيف جداً يمنح المستخدم إحساس النقرة
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-black text-[11px] relative select-none cursor-pointer transition-all duration-200 ${
                          IsActive ? 'text-[#7A1C2E] shadow-md' : 'text-red-100 hover:bg-white/5 active:bg-white/10'
                        }`}
                      >
                        {/* خلفية الزر النشط المستقرة */}
                        {IsActive && (
                          <motion.div
                            layoutId="royalActiveBgMobile"
                            className="absolute inset-0 bg-white rounded-xl z-0"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        
                        {/* محاذاة اليمين */}
                        <span className="relative z-10 flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${IsActive ? 'stroke-[2.5] text-[#7A1C2E]' : 'stroke-[1.5] text-red-200/80'}`} />
                          <span>{item.name}</span>
                        </span>

                        {/* محاذاة اليسار (البادجات) */}
                        {item.badge && (
                          <span className="relative z-10">
                            {item.badge.type === 'ai' ? (
                              <span className="flex items-center gap-1 text-[8px] bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                                <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                                {item.badge.text}
                              </span>
                            ) : (
                              <span className="text-[8px] bg-white/10 text-white px-2 py-0.5 rounded-full font-bold">
                                {item.badge.text}
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* زر تسجيل الخروج السفلي الفخم */}
              <div className="border-t border-white/10 pt-4">
                <button 
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-black text-[11px] bg-white/5 text-red-200 hover:bg-white/10 active:scale-95 transition-all border border-white/5 shadow-inner"
                >
                  <LogOut className="w-4 h-4 text-red-300" />
                  تسجيل الخروج من المنظومة
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
