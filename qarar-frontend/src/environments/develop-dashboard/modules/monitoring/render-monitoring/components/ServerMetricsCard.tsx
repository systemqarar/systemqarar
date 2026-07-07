import React from 'react';
import { RenderStatus } from '../types/render.types';

interface Props {
  status: RenderStatus | null;
}

export const ServerMetricsCard: React.FC<Props> = ({ status }) => {
  const isOnline = status?.status === 'online';
  const isOffline = status?.status === 'offline';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-sans text-white text-right" dir="rtl">
      
      {/* الكارت الأول: حالة الاتصال الحية */}
      <div className="bg-[#111A35] border border-[#1E294B] hover:border-slate-700 p-4 rounded-xl transition-all duration-200 shadow-lg">
        <p className="text-xs text-slate-400">حالة الاتصال بالخادم</p>
        <div className="flex items-center gap-2 mt-2">
          {/* لمشة إشارة ذكية تتغير حركتها وألوانها حسب الحالة الحقيقية */}
          <span className={`w-2.5 h-2.5 rounded-full ${
            isOnline ? 'bg-emerald-500 animate-pulse' : isOffline ? 'bg-rose-500' : 'bg-amber-500 animate-ping'
          }`}></span>
          <p className={`text-lg font-bold uppercase ${
            isOnline ? 'text-emerald-400' : isOffline ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {status ? (isOnline ? 'نشط (Online)' : 'متوقف (Offline)') : 'جاري الفحص...'}
          </p>
        </div>
      </div>

      {/* الكارت الثاني: سرعة الاستجابة الفعلية */}
      <div className="bg-[#111A35] border border-[#1E294B] hover:border-slate-700 p-4 rounded-xl transition-all duration-200 shadow-lg">
        <p className="text-xs text-slate-400">سرعة استجابة الـ API</p>
        <p className={`text-lg font-bold mt-2 font-mono ${isOnline ? 'text-slate-200' : 'text-slate-500'}`} dir="ltr">
          {status && isOnline ? status.latency : '--'}
        </p>
      </div>

      {/* الكارت الثالث: معدل الاستقرار المستمر */}
      <div className="bg-[#111A35] border border-[#1E294B] hover:border-slate-700 p-4 rounded-xl transition-all duration-200 shadow-lg">
        <p className="text-xs text-slate-400">معدل التشغيل المستمر (Uptime)</p>
        <p className={`text-lg font-bold mt-2 font-mono ${status ? 'text-slate-200' : 'text-slate-500'}`} dir="ltr">
          {status ? status.uptime : '--'}
        </p>
      </div>

      {/* الكارت الرابع: البيئة والنطاق الجغرافي الحقيقي */}
      <div className="bg-[#111A35] border border-[#1E294B] hover:border-slate-700 p-4 rounded-xl transition-all duration-200 shadow-lg">
        <p className="text-xs text-slate-400">البيئة والمنطقة الجغرافية</p>
        <p className="text-sm font-medium text-slate-300 mt-2 truncate font-mono" dir="ltr">
          {status ? `${status.environment} | ${status.region?.split(' ')[0] || 'eu'}` : '---'}
        </p>
      </div>

    </div>
  );
};
