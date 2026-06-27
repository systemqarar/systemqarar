import { X, Home, CheckSquare, MessageSquare, User, LogOut } from 'lucide-react';

// هنا بنفهم المنيو إنها حتستقبل التحكم (مفتوحة ولا مقفولة) من برا
interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarDrawer = ({ isOpen, onClose, activeTab, setActiveTab }: SidebarDrawerProps) => {
  
  // لستة أزرار القائمة الجانبية
  const menuItems = [
    { id: 'overview', name: 'الرئيسية', icon: Home },
    { id: 'tasks', name: 'المهام والأنشطة', icon: CheckSquare },
    { id: 'ghaith', name: 'مساعد غيث', icon: MessageSquare },
    { id: 'profile', name: 'الملف الشخصي', icon: User },
  ];

  return (
    <>
      {/* الخلفية المظلمة لما المنيو تفتح */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm" onClick={onClose} />
      )}

      {/* جسم القائمة الجانبية الكبدية */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-[#7A1C2E] text-white z-50 p-6 shadow-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* هيدر المنيو وزر القفل */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7A1C2E] font-black">ق</div>
            <span className="font-black text-lg tracking-wide">نظام قرار</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* الأزرار والتنقل */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const IsActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose(); // بتقفل المنيو تلقائياً بعد الضغط
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  IsActive 
                    ? 'bg-white text-[#7A1C2E] shadow-lg' 
                    : 'text-red-100 hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${IsActive ? 'text-[#7A1C2E]' : 'text-red-200'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* زر تسجيل الخروج التحت */}
        <div className="absolute bottom-6 right-6 left-6">
          <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm bg-black/20 text-red-200 hover:bg-black/30 transition-all">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>

      </div>
    </>
  );
};
