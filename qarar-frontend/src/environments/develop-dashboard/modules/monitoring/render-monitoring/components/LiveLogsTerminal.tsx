import React, { useState, useEffect, useRef } from 'react';
import { RenderLog } from '../types/render.types';

interface Props {
  logs: RenderLog[];
  onRefresh: () => void;
}

export const LiveLogsTerminal: React.FC<Props> = ({ logs, onRefresh }) => {
  // 🚀 حالة التحكم في الفلترة (كل السجلات، أخطاء، تحذيرات، معلومات)
  const [activeFilter, setActiveFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // ميزة التمرير التلقائي لأسفل الشاشة عند وصول سجلات جديدة
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeFilter]);

  // تصفية السجلات بناءً على الفلتر المختار
  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'all') return true;
    return log.level === activeFilter;
  });

  return (
    <div className="bg-[#070C1E] border border-[#1E294B] rounded-xl overflow-hidden shadow-2xl font-sans text-white text-right" dir="rtl">
      
      {/* هيدر الـ Terminal الفاخر */}
      <div className="bg-[#111A35] border-b border-[#1E294B] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* أزرار نظام الماك التقليدية */}
          <span className="w-3 h-3 rounded-full bg-[#C3073F]"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <h3 className="text-xs font-mono text-slate-400 mr-2" dir="ltr">render-live-stream.log</h3>
          <span className="text-[10px] bg-[#1E294B] text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {filteredLogs.length} سطر
          </span>
        </div>

        {/* 🛠️ أزرار الفلترة المتقدمة والتحديث */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex bg-[#070C1E] p-0.5 rounded-lg border border-[#1E294B] text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md transition ${activeFilter === 'all' ? 'bg-[#C3073F] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveFilter('error')}
              className={`px-2.5 py-1 rounded-md transition ${activeFilter === 'error' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:bg-rose-950/30'}`}
            >
              الأخطاء
            </button>
            <button
              onClick={() => setActiveFilter('warn')}
              className={`px-2.5 py-1 rounded-md transition ${activeFilter === 'warn' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400 hover:bg-amber-950/30'}`}
            >
              التحذيرات
            </button>
          </div>

          <button 
            onClick={onRefresh}
            className="text-xs bg-[#1E294B] hover:bg-[#C3073F] hover:text-white text-slate-300 px-3 py-1.5 rounded-lg font-medium transition duration-200"
          >
            🔄 تحديث السجلات
          </button>
        </div>
      </div>
      
      {/* شاشة عرض الأسطر (Terminal Screen) */}
      <div className="p-4 font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto leading-relaxed text-left" dir="ltr">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-slate-500 py-8 font-sans">
            🚫 لا توجد سجلات تطابق الفلتر الحالي في هذه الفترة.
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-start gap-2 hover:bg-[#111A35]/40 p-1.5 rounded transition-colors border-l-2 border-transparent hover:border-[#C3073F]">
              {/* التوقيت اللحظي */}
              <span className="text-slate-500 select-none">
                [{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}]
              </span>
              
              {/* رتبة السجل وألوانه الذكية */}
              <span className={`font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-opacity-10 ${
                log.level === 'error' 
                  ? 'text-rose-400 bg-rose-500' 
                  : log.level === 'warn' 
                    ? 'text-amber-400 bg-amber-500' 
                    : 'text-sky-400 bg-sky-500'
              }`}>
                {log.level}:
              </span>
              
              {/* نص الرسالة */}
              <span className="text-slate-300 flex-1 whitespace-pre-wrap">{log.message}</span>
            </div>
          ))
        )}
        {/* عنصر وهمي للربط لضمان النزول التلقائي لآخر السطور */}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
