import { useState, useEffect } from 'react';
import { Radio, Ambulance, Home, Navigation, ShieldCheck, Map, Users, Grid, AlertTriangle, Package, Clock, ArrowLeft } from 'lucide-react';
import { useTasksEngine } from '../../tasks-activities/tasks-engine/hooks/useTasksEngine';
import { Task } from '../../tasks-activities/tasks-engine/types/tasks-engine.types';

export const BentoGrid = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // جلب المهام وسوق الفرص من الـ Engine
  const engine = useTasksEngine() || {};
  const { tasks = [], fetchTasks, applyForTask = () => {} } = engine;

  useEffect(() => {
    if (fetchTasks) {
      fetchTasks();
    }
  }, [fetchTasks]);

  // تصفية المهام المفتوحة في سوق الفرص (assignment_type === 'open_announcement' و status === 'open')
  const safeTasks: Task[] = Array.isArray(tasks) ? tasks : [];
  const openOpportunities = safeTasks.filter(
    (task: Task) => task && task.assignment_type === 'open_announcement' && task.status === 'open'
  );

  return (
    <div className="px-5 mt-4 space-y-6" dir="rtl">
      
      {/* 🌟 قسم سوق الفرص المتاحة للانضمام في الداشبورد الرئيسي */}
      {openOpportunities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#7A1C2E] animate-pulse"></span>
              فرص التطوع المتاحة للانضمام
            </h3>
            <span className="text-xs font-bold text-[#7A1C2E] bg-red-50 px-3 py-1 rounded-full border border-red-100">
              {openOpportunities.length} فرصة متاحة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {openOpportunities.map((task: Task) => (
              <div 
                key={task.id} 
                className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:border-[#7A1C2E]/40 transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-[#7A1C2E]" />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#7A1C2E] transition-colors">
                      {task.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-[#7A1C2E] shrink-0">
                      سوق الفرص
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-gray-50">
                    {task.due_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#7A1C2E]" />
                        {new Date(task.due_time).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#7A1C2E]" />
                      المطلوب: {task.max_volunteers || 1} متطوعين
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">متاحة للانضمام الفوري</span>
                  <button
                    onClick={() => applyForTask(task.id)}
                    className="px-4 py-2 bg-[#7A1C2E] hover:bg-[#621524] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    انضم الآن
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-gray-400 text-xs mb-1">خدمات الميدان</p>
        <h2 className="text-2xl font-black text-slate-900 mb-4">اكتشف المزيد</h2>

        {/* تبويبات التصنيف (Pills) */}
        <div className="flex gap-2 mb-5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { id: 'all', label: 'الجميع', icon: Grid },
            { id: 'emergency', label: 'الطوارئ', icon: AlertTriangle },
            { id: 'logistics', label: 'اللوجستيات', icon: Package },
          ].map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-bold ${
                activeCategory === cat.id 
                  ? 'bg-[#7A1C2E] text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-gray-200'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* شبكة المربعات (Bento) */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="col-span-2 grid grid-cols-2 gap-3">
            <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100">
              <Radio className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
              <span className="text-[11px] font-bold text-slate-800 text-center">أجهزة الاتصال</span>
            </div>
            <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100 relative">
              <span className="absolute top-2 right-2 bg-red-50 text-[#7A1C2E] text-[9px] font-bold px-2 py-0.5 rounded-full">قريباً</span>
              <Ambulance className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
              <span className="text-[11px] font-bold text-slate-800 text-center">حركة الإسعاف</span>
            </div>
            <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100">
              <Home className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
              <span className="text-[11px] font-bold text-slate-800 text-center">مراكز الإيواء</span>
            </div>
            <div className="bg-white rounded-3xl p-3 flex flex-col items-center justify-center aspect-square shadow-sm border border-gray-100 relative">
              <span className="absolute top-2 right-2 bg-red-50 text-[#7A1C2E] text-[9px] font-bold px-2 py-0.5 rounded-full">قريباً</span>
              <Navigation className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
              <span className="text-[11px] font-bold text-slate-800 text-center">التوجيه</span>
            </div>
          </div>

          {/* كارت قائد الميدان الطولي */}
          <div className="col-span-1 bg-white rounded-3xl p-3 flex flex-col items-center justify-center shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-red-50 to-transparent" />
            <ShieldCheck className="w-12 h-12 text-[#7A1C2E] mb-3 relative z-10 stroke-[1.5]" />
            <span className="text-xs font-black text-slate-800 text-center relative z-10">قائد الميدان</span>
          </div>

          <div className="col-span-2 bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <Map className="w-7 h-7 text-slate-700 stroke-[1.5]" />
              <span className="text-xs font-bold text-slate-800">خرائط الكوارث</span>
            </div>
          </div>
          
          <div className="col-span-1 bg-white rounded-3xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100">
            <Users className="w-7 h-7 text-slate-700 mb-1 stroke-[1.5]" />
            <span className="text-[10px] font-bold text-slate-800">المتطوعين</span>
          </div>
        </div>
      </div>

    </div>
  );
};
