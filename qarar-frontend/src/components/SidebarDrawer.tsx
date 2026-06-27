import { motion } from 'framer-motion';
import { X, Home, User, ClipboardList, MessageSquare, FileText, LogOut } from 'lucide-react';

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
    { id: 'tasks', name: 'المهام والأنشطة', icon: ClipboardList },
    { id: 'communication', name: 'مركز التواصل الذكي', icon: MessageSquare },
    { id: 'documents', name: 'الخطابات والوثائق', icon: FileText },
  ];

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      
      {/* 🌑 الخلفية المظلمة الشفافة */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      {/* 🎪 جسم القائمة المنزلق المزخرف */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="absolute top-0 right-0 h-full w-[80vw] max-w-xs text-white p-6 flex flex-col justify-between shadow-2xl overflow-hidden bg-gradient-to-br from-[#500C18] via-[#7A1C2E] to-[#A3263D]"
      >
        
        {/* 🎨 طبقة الزخارف الخلفية (Decorative Background Layer) */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          {/* 🌌 الوهج العائم العلوي */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-red-400/20 blur-3xl"
          />
          
          {/* 🌌 الوهج العائم السفلي */}
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2], 
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl"
          />

          {/* 📐 النقش الهندسي الشبكي المائي */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)]" />
        </div>

        {/* 🏛️ المحتوى الأمامي (مرفوع فوق الزخارف بـ z-10) */}
        <div className="relative z-10">
          {/* هيدر المنيو */}
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7A1C2E] font-black text-xs shadow-inner">ق</div>
              <span className="font-bold text-sm tracking-wide">نظام قرار الإداري</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full bg-white/10 active:scale-90 transition-transform">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 🧭 الأزرار بنظام الشلال الذكي */}
          <motion.nav 
            animate={isOpen ? "open" : "closed"}
            variants={{
              open: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
              closed: {}
            }}
            className="space-y-2"
          >
            {menuItems.map((item) => {
              const IsActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  variants={{
                    open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
                    closed: { opacity: 0, y: 15 }
                  }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setTimeout(onClose, 120);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm relative select-none cursor-pointer transition-colors ${
                    IsActive ? 'text-[#7A1C2E]' : 'text-red-100 hover:bg-white/5'
                  }`}
                >
                  {IsActive && (
                    <motion.div
                      layoutId="royalActiveBg"
                      className="absolute inset-0 bg-white rounded-2xl z-0 shadow-lg shadow-black/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${IsActive ? 'stroke-[2.5]' : 'stroke-[1.5] text-red-200'}`} />
                    <span>{item.name}</span>
                  </span>
                </motion.button>
              );
            })}
          </motion.nav>
        </div>

        {/* زر تسجيل الخروج السفلي */}
        <div className="border-t border-white/10 pt-4 relative z-10">
          <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm bg-black/20 backdrop-blur-md text-red-200 hover:bg-black/30 active:scale-98 transition-all shadow-inner">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </motion.div>
    </div>
  );
};
