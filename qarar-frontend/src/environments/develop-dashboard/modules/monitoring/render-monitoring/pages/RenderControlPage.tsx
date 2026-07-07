import React from 'react';
import { useRenderStatus } from '../hooks/useRenderStatus';
import { ServerMetricsCard } from '../components/ServerMetricsCard';
import { LiveLogsTerminal } from '../components/LiveLogsTerminal';
import { useNavigate } from 'react-router-dom';

const RenderControlPage: React.FC = () => {
  const { status, logs, loading, refetch } = useRenderStatus();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#C3073F] mb-4"></div>
        <p className="text-sm">جاري الاتصال بسيرفر ريندر وسحب السجلات اللحظية...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">لوحة تحكم خوادم Render</h1>
          <p className="text-xs text-slate-400 mt-1">المراقبة التفصيلية لأداء المحرك الخلفي لمنظومة قرار.</p>
        </div>
        <button 
          onClick={() => navigate('/developer/monitoring')}
          className="text-xs bg-[#111A35] border border-[#1E294B] px-3 py-1.5 rounded-lg text-slate-300 hover:bg-[#1E294B]"
        >
          الرجوع للمركز الرئيسي
        </button>
      </div>

      <ServerMetricsCard status={status} />
      <LiveLogsTerminal logs={logs} onRefresh={refetch} />
    </div>
  );
};

export default RenderControlPage;
