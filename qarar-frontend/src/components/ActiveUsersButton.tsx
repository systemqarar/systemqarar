import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X } from 'lucide-react';
import { useSocket } from '../hooks/useSocket'; // 🔌 التعديل الجذري: استيراد الهوك من مساره الصحيح في الـ hooks
import { ActiveUser } from '../context/SocketContext'; // 🔑 استيراد الواجهة الصارمة للنوع لتأمين التقييم التلقائي في TS

// دالة ذكية لتحويل فارق الوقت لعبارات عربية مريحة ومفهومة
const formatLastSeen = (dateString: string): string => {
  const now = new Date();
  const lastSeen = new Date(dateString);
  const diffInMs = now.getTime() - lastSeen.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInMinutes < 1) return 'نشط الآن';
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) return 'نشط قبل دقيقة';
    if (diffInMinutes === 2) return 'نشط قبل دقيقتين';
    if (diffInMinutes >= 3 && diffInMinutes <= 10) return `نشط قبل ${diffInMinutes} دقائق`;
    return `نشط قبل ${diffInMinutes} دقيقة`;
  }
  
  if (diffInHours === 1) return 'نشط قبل ساعة';
  if (diffInHours === 2) return 'نشط قبل ساعتين';
  if (diffInHours >= 3 && diffInHours <= 10) return `نشط قبل ${diffInHours} ساعات`;
  return `نشط قبل ${diffInHours} ساعة`;
};

export const ActiveUsersButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeUsers } = useSocket();
  const containerRef = useRef<HTMLDivElement>(null);

  // 🛡️ تحديد نوع الـ user بشكل صريح لمنع خطأ الـ TS7006 (implicit any)
  const onlineCount = activeUsers.filter((user: ActiveUser) => user.is_online).length;

  // إغلاق النافذة تلقائياً عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative select-none" dir="rtl">
      
      {/* 🔘 الزر الرئيسي للتفعيل (مساحة الـ 40% بجانب غيث) */}
      <div className="relative group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        
        {onlineCount > 0 && (
          <div className="absolute inset-0 bg-green-500/10 rounded-full blur-md animate-pulse pointer-events-none" />
        )}

        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="relative bg-[#0B1528] text-white rounded-full p-2 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-md h-[58px] pr-3 pl-3"
        >
          {/* محتوى الزر */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white border border-white/10 shrink-0 relative">
              <Users className="w-5 h-5 text-slate-300" />
              {/* نقطة خضراء تشع بالنبض إذا كان هناك أعضاء متصلين حالياً */}
              {onlineCount > 0 && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B1528] animate-pulse" />
              )}
            </div>

            <div className="flex flex-col text-right">
              <span className="text-xs font-black text-slate-100">النشطون الآن</span>
              <span className="text-[9px] text-green-400 font-bold mt-0.5">
                {onlineCount} متصل حالياً
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 📋 النافذة المنبثقة للأعلى (Popover) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full left-0 right-0 z-40 bg-[#0B1528]/95 border border-white/10 rounded-3xl p-4 shadow-2xl backdrop-blur-lg w-[280px] sm:w-[320px] max-h-[380px] overflow-hidden flex flex-col"
          >
            {/* رأس النافذة المنبثقة */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">قائمة المتواجدين (خلال 12 ساعة)</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* جسد القائمة وقائمة الأسماء */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar max-h-[280px]">
              {activeUsers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  لا يوجد أعضاء نشطون حالياً.
                </div>
              ) : (
                // 🛡️ تحديد نوع الـ user بشكل صريح هنا أيضاً لمنع أخطاء الـ TS7006 أثناء عمل map
                activeUsers.map((user: ActiveUser) => (
                  <div 
                    key={user.user_id}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* الصورة الشخصية أو الاسم الرمزي */}
                      <div className="relative w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                        {user.secure_photo_url || user.photo_url ? (
                          <img 
                            src={user.secure_photo_url || user.photo_url || ''} 
                            alt={user.full_name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-black text-slate-300">
                            {user.full_name?.charAt(0) || 'ع'}
                          </span>
                        )}
                        {/* حالة الاتصال اللحظي */}
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0B1528] ${user.is_online ? 'bg-green-500' : 'bg-slate-500'}`} />
                      </div>

                      {/* اسم العضو وحالته */}
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-bold text-slate-100">{user.full_name || 'عضو غير معروف'}</span>
                        <span className={`text-[9px] font-medium mt-0.5 ${user.is_online ? 'text-green-400' : 'text-slate-400'}`}>
                          {user.is_online ? 'متصل الآن' : formatLastSeen(user.last_seen)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
