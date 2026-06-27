import { ChevronLeft } from 'lucide-react';

export const EmergencyCards = () => {
  return (
    <div className="flex overflow-x-auto gap-3 px-5 pb-4 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* كارت تحليل البيانات */}
      <div className="min-w-[260px] snap-center h-32 rounded-3xl bg-[#7A1C2E] relative overflow-hidden p-4 flex flex-col justify-end shadow-md">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400" 
          className="absolute inset-0 w-full h-full object-cover opacity-40" 
          alt="تحليل البيانات" 
        />
        <div className="relative z-20">
          <h3 className="text-white font-black text-lg">تحليل البيانات</h3>
          <p className="text-red-200 text-xs mt-1">الرصد الميداني اللحظي</p>
        </div>
      </div>

      {/* كارت نداء الطوارئ */}
      <div className="min-w-[260px] snap-center h-32 rounded-3xl bg-[#8C2337] relative overflow-hidden p-4 flex items-center justify-center shadow-md">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-20 text-center">
          <h3 className="text-white font-black text-xl mb-2">نداء طوارئ</h3>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold py-1.5 px-4 rounded-full flex items-center gap-2 mx-auto">
            <ChevronLeft className="w-3 h-3" />
            استعد الآن
          </button>
        </div>
      </div>

    </div>
  );
};
