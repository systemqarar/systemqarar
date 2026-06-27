import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, User, ClipboardList, MessageSquare, FileText, LogOut } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarDrawer = ({ isOpen, onClose, activeTab, setActiveTab }: SidebarDrawerProps) => {
  
  // 📋 نفس الأزرار الخمسة المتطابقة مع الـ DashboardLayout بالظبط لضمان المزامنة
  const menuItems = [
    { id: 'overview', name: 'الرئيسية (Overview)', icon: Home },
    { id: 'profile', name: 'الملف الشخصي (Profile)', icon: User },
    { id: 'tasks', name: 'المهام والأنشطة', icon: ClipboardList },
    { id: 'communication', name: 'مركز التواصل الذكي', icon: MessageSquare },
    { id: 'documents', name: 'الخطابات والوثائق', icon: FileText },
  ];

  // 🎭 1. ميكانيكية تأثير الشلال (Stagger) لتوالي سقوط الأزرار
  const containerVariants = {
    open: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    },
    closed: {}
  };

  const itemVariants = {
    open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    closed: { opacity: 0, y: 20 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 🌑 الخلفية المظلمة الشفافة مع تأثير التلاشي الناعم */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />

          {/* 🎪 جسم القائمة الجانبية مع تأثير الارتداد المرن (Spring Bounce) عند السحب */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-[80vw] max-w-xs bg-[#7A1C2E] text-white z-50 p-6 flex flex-col justify-between shadow-2xl"
          >
            <div>
              {/* هيدر المنيو وزر القفل */}
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7A1C2E] font-black text-xs">ق</div>
                  <span className="font-bold text-sm">نظام قرار الإداري</span>
                </div>
                <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-transform">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 🧭 قائمة الأزرار المتحركة بنظام الشلال */}
              <motion.nav 
                variants={containerVariants}
                initial="closed"
                animate="open"
                className="space-y-2"
              >
                {menuItems.map((item) => {
                  const IsActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      variants={itemVariants}
                      onClick={() => {
                        setActiveTab(item.id);
                        setTimeout(onClose, 150); // تأخير قفل المنيو كسر من الثانية ليستمتع المستخدم بحركة الزر
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-colors relative select-none cursor-pointer ${
                        IsActive ? 'text-[#7A1C2E]' : 'text-red-100 hover:bg-white/5'
                      }`}
                    >
                      {/* 💎 السحر هنا: الكبسولة البيضاء الذكية البتتزحلق بين الأزرار (Shared Layout) */}
                      {IsActive && (
                        <motion.div
                          layoutId="royalActiveBg"
                          className="absolute inset-0 bg-white rounded-2xl z-0 shadow-lg shadow-black/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      {/* المحتوى (الأيقونة والنص) مع رفعه فوق طبقة الخلفية المتحركة */}
                      <span className="relative z-10 flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${IsActive ? 'stroke-[2.5]' : 'stroke-[1.5] text-red-200'}`} />
                        <span>{item.name}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </motion.nav>
            </div>

            {/* زر تسجيل الخروج التحت */}
            <div className="border-t border-white/10 pt-4">
              <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm bg-black/10 text-red-200 hover:bg-black/20 active:scale-98 transition-all">
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
