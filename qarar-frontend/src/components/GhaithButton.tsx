import { Sparkles, ChevronLeft } from 'lucide-react';

interface GhaithButtonProps {
  onClick: () => void;
}

export const GhaithButton = ({ onClick }: GhaithButtonProps) => {
  return (
    <div className="fixed bottom-24 left-5 right-5 z-30">
      <div className="bg-[#0B1528] text-white rounded-full p-2.5 flex items-center justify-between shadow-xl border border-white/10 backdrop-blur-md">
        
        {/* النجوم والحركة اللطيفة بالجنب */}
        <button onClick={onClick} className="bg-gradient-to-r from-amber-400 to-orange-500 p-2 rounded-full text-slate-950 flex items-center justify-center active:scale-95 transition-transform">
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <Sparkles className="w-4 h-4 fill-slate-950 animate-pulse hidden" />
        </button>

        {/* كلمة اسأل مساعدك غيث */}
        <span className="text-xs font-black text-slate-200 pl-4">اسأل مساعدك غيث</span>
        
      </div>
    </div>
  );
};
