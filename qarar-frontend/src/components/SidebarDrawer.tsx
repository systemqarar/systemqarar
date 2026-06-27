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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
        className="absolute top-0 right-0 h-full w-[80vw] max-w-xs text-white p-6 flex flex-col justify-between shadow-2xl overflow-hidden bg-gradient-to-b from-[#601220] to-[#8C2337]"
      >
        
        {/* 📐 زخرفة هندسية شبكية ثابتة (خفيفة جداً على المعالج وواضحة العين) */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        {/* هالة ضوئية واحدة ثابتة بالركن السفلي */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7A1C2E] font-black text-xs shadow-inner">ق</div>
              <span className="font-bold text-sm tracking-wide">نظام قرار الإداري</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full bg-white/10 active:scale-75 transition-transform">
              <X className="w-5 h-5" />
            </button>
          </div>

          <motion.nav 
            animate={isOpen ? "open" : "closed"}
            variants={{ open: { transition: { staggerChildren: 0.03 } }, closed: {} }}
            className="space-y-2"
          >
            {menuItems.map((item) => {
              const IsActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 10 } }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setTimeout(onClose, 100);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm relative select-none cursor-pointer ${
                    IsActive ? 'text-[#7A1C2E]' : 'text-red-100 hover:bg-white/5'
                  }`}
                >
                  {IsActive && (
                    <motion.div
                      layoutId="royalActiveBg"
                      className="absolute inset-0 bg-white rounded-2xl z-0 shadow-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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

        <div className="border-t border-white/10 pt-4 relative z-10">
          <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm bg-black/10 text-red-200 active:scale-95 transition-transform">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </motion.div>
    </div>
  );
};
