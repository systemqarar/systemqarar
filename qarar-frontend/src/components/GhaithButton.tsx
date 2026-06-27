import { motion } from 'framer-motion';
import { Sparkles, ChevronLeft } from 'lucide-react';

interface GhaithButtonProps {
  onClick: () => void;
}

export const GhaithButton = ({ onClick }: GhaithButtonProps) => {
  return (
    <div className="fixed bottom-24 left-5 right-5 z-30 select-none" dir="rtl">
      
      {/* الحاوية التفاعلية بالكامل قابلة للضغط لتسهيل التجربة على الموبايل */}
      <div className="relative group cursor-pointer" onClick={onClick}>
        
        {/* ✨ هالة الذكاء الاصطناعي الخلفية (تأثير نبض خفيف غير مزعج) */}
        <div className="absolute inset-0 bg-gradient-to-l from-amber-500/10 to-orange-600/10 rounded-full blur-md animate-pulse pointer-events-none" />

        {/* 🌌 جسم الكبسولة الرئيسي (احتفظنا بلونك الفخم الداكن) */}
        <motion.div 
          whileTap={{ scale: 0.98 }} // إحساس ضغط فيزيائي ممتع عند لمس الكبسولة
          className="relative bg-[#0B1528] text-white rounded-full p-2 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-md"
        >
          
          {/* 👥 الجزء الأيمن: هوية غيث البصرية مع النص الترحيبي */}
          <div className="flex items-center gap-3 pr-2">
            
            {/* الدائرة الرمزية لغيث (Avatar) */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7A1C2E] to-[#A3263D] flex items-center justify-center text-white font-black text-sm border border-white/20 shadow-inner shrink-0 relative">
              غ
              {/* نقطة خضراء صغيرة تعني أن الذكاء الاصطناعي متصل Live */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B1528]" />
            </div>

            {/* النصوص الترحيبية الذكية */}
            <div className="flex flex-col text-right">
              <span className="text-xs font-black text-slate-100 tracking-wide">اسأل مساعدك غيث</span>
              <span className="text-[9px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                {/* النجوم الآن تتحرك وتلمع بشكل انسيابي */}
                <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                مساعدك الشخصي متصل الآن
              </span>
            </div>
          </div>

          {/* 👈 الجزء الأيسر: زر الانتقال (Chevron) بتأثير حركي جذاب */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 p-2.5 rounded-full text-slate-950 flex items-center justify-center shadow-lg border border-amber-300/20"
          >
            {/* حركة ارتدادية خفيفة للسهم تلفت عين المستخدم للضغط */}
            <motion.div
              animate={{ x: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </motion.div>
          </motion.button>
          
        </motion.div>
      </div>
    </div>
  );
};
