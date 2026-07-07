import React from 'react';
import { RenderLog } from '../types/render.types';

interface Props {
  logs: RenderLog[];
  onRefresh: () => void;
}

export const LiveLogsTerminal: React.FC<Props> = ({ logs, onRefresh }) => {
  return (
    <div className="bg-[#070C1E] border border-[#1E294B] rounded-xl overflow-hidden shadow-2xl font-sans text-white">
      <div className="bg-[#111A35] border-b border-[#1E294B] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C3073F]"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <h3 className="text-xs font-mono text-slate-400 mr-2">render-live-stream.log</h3>
        </div>
        <button 
          onClick={onRefresh}
          className="text-xs text-[#C3073F] hover:underline font-medium"
        >
          تحديث السجلات
        </button>
      </div>
      
      <div className="p-4 font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto leading-relaxed">
        {logs.map((log, index) => (
          <div key={index} className="flex flex-col md:flex-row md:items-start gap-2 hover:bg-[#111A35]/30 p-1.5 rounded transition-colors">
            <span className="text-slate-500 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={`font-bold ${log.level === 'error' ? 'text-rose-500' : log.level === 'warn' ? 'text-amber-500' : 'text-sky-400'}`}>
              {log.level.toUpperCase()}:
            </span>
            <span className="text-slate-300 flex-1">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
