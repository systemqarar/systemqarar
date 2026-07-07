import React from 'react';
import { RenderStatus } from '../types/render.types';

interface Props {
  status: RenderStatus | null;
}

export const ServerMetricsCard: React.FC<Props> = ({ status }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-sans text-white">
      <div className="bg-[#111A35] border border-[#1E294B] p-4 rounded-xl">
        <p className="text-xs text-slate-400">حالة الاتصال بالخادم</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-lg font-bold uppercase text-emerald-400">{status?.status || 'Online'}</p>
        </div>
      </div>

      <div className="bg-[#111A35] border border-[#1E294B] p-4 rounded-xl">
        <p className="text-xs text-slate-400">سرعة استجابة الـ API</p>
        <p className="text-lg font-bold text-slate-200 mt-2">{status?.latency || '24ms'}</p>
      </div>

      <div className="bg-[#111A35] border border-[#1E294B] p-4 rounded-xl">
        <p className="text-xs text-slate-400">معدل التشغيل المستمر (Uptime)</p>
        <p className="text-lg font-bold text-slate-200 mt-2">{status?.uptime || '99.98%'}</p>
      </div>

      <div className="bg-[#111A35] border border-[#1E294B] p-4 rounded-xl">
        <p className="text-xs text-slate-400">البيئة والمنطقة الجغرافية</p>
        <p className="text-sm font-medium text-slate-300 mt-2 truncate">
          {status?.environment || 'production'} | {status?.region?.split(' ')[0] || 'eu'}
        </p>
      </div>
    </div>
  );
};
