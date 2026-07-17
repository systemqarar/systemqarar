import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 👈 استيراد أدوات التوجيه لربط المسارات حقيقياً
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, User, ClipboardList, MessageSquare, FileText, LogOut, Sparkles } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarDrawer = ({ isOpen, onClose, activeTab, setActiveTab }: SidebarDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home, path: '/dashboard' },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User, path: '/dashboard/profile' },
    { 
      id: 'tasks', 
      name: 'المهام والأنشطة', 
      icon: ClipboardList, 
      badge: { text: '٣ نشطة', type: 'info' },
      path: '/dashboard/tasks'
    },
    { 
      id: 'communication', 
      name: 'مركز التواصل الذكي', 
      icon: MessageSquare, 
      badge: { text: 'جاري إدارة الاجتماع', type: 'ai' },
      path: '/dashboard/communication'
    },
    // 👈 تم تعديل المعرف والاسم هنا ليتطابق مع موديول الخطابات والتقارير الجديد
    { id: 'letters', name: 'الخطابات الرسمية والتقارير', icon: FileText, path: '/dashboard/letters' },
  ];

  // 🔄 مزامنة التبويب النشط تلقائياً بناءً على الرابط الحالي في المتصفح
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedItem = menuItems.find(item => item.path === currentPath);
    if (matchedItem) {
      setActiveTab(matchedItem.id);
    } else if (currentPath === '/dashboard') {
      setActiveTab('overview');
    }
  }, [location.pathname, setActiveTab]);

  // إعدادات الشلال الحركي للأزرار الداخلية
  const containerVariants = {
    open: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    },
    closed: {}
  };

  const itemVariants = {
    open: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 22 } },
    closed: { opacity: 0, x: 30, scale: 0.95 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-start p-4" dir="rtl">
          
          {/* الخلفية المظلمة الشفافة */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[5px]"
          />

          {/* جسم اللوحة العائمة المعالج للقص ذو الحركة السحرية */}
          <motion.div 
            initial={{ x: '120%', opacity: 0.5, scale: 0.96 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: '120%', opacity: 0.5, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            style={{ willChange: 'transform' }}
            className="absolute top-4 bottom-4 right-4 w-[85vw] max-w-[290px] text-white p-5 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] bg-gradient-to-b from-[#560E1A] via-[#7A1C2E] to-[#380710] rounded-[2.5rem] border border-white/10 overflow-hidden z-10"
          >
            
            {/* الخلفية الهندسية الفخمة */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                {/* الهيدر الموحد باللوقو الرسمي */}
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
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

                {/* الأزرار التفاعلية بنظام الشلال الحركي والاتصال بالـ Router */}
                <motion.nav 
                  variants={containerVariants}
                  animate="open"
                  initial="closed"
                  className="space-y-1"
                >
                  {menuItems.map((item) => {
                    const IsActive = activeTab === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        variants={itemVariants}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setActiveTab(item.id);
                          navigate(item.path); // 👈 توجيه المستخدم للمسار الفعلي للمتصفح
                          setTimeout(onClose, 120);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-black text-[11px] relative select-none cursor-pointer transition-all duration-200 ${
                          IsActive ? 'text-[#7A1C2E]' : 'text-red-100 hover:bg-white/5 active:bg-white/10'
                        }`}
                      >
                        {IsActive && (
                          <motion.div
                            layoutId="royalActiveBgMobile"
                            className="absolute inset-0 bg-white rounded-xl z-0 shadow-md"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        
                        <span className="relative z-10 flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${IsActive ? 'stroke-[2.5] text-[#7A1C2E]' : 'stroke-[1.5] text-red-200/80'}`} />
                          <span>{item.name}</span>
                        </span>

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
                      </motion.button>
                    );
                  })}
                </motion.nav>
              </div>

              {/* زر تسجيل الخروج المستقر تماماً */}
              <div className="border-t border-white/10 pt-4">
                <button 
                  onClick={() => {
                    localStorage.removeItem('qarar_token');
                    window.location.href = '/login';
                  }}
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
