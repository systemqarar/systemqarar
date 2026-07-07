import React from 'react';
import { useRenderStatus } from '../hooks/useRenderStatus';
import { ServerMetricsCard } from '../components/ServerMetricsCard';
import { LiveLogsTerminal } from '../components/LiveLogsTerminal';
import { useNavigate } from 'react-router-dom';

const RenderControlPage: React.FC = () => {
  // 🚀 استدعاء الميزات المتقدمة الجديدة من الـ Hook الحقيقي
  const { status, logs, loading, isDeploying, triggerDeploy, refetch } = useRenderStatus();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 font-sans" dir="rtl">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#C3073F] mb-4"></div>
        <p className="text-sm">جاري الاتصال بسيرفر ريندر وسحب السجلات اللحظية الحقيقية...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans text-white text-right" dir="rtl">
      {/* القسم العلوي: الهيدر وأزرار التحكم الحية */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E294B] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">لوحة تحكم خوادم Render</h1>
          <p className="text-xs text-slate-400 mt-1">المراقبة التفصيلية، جلب السجلات الحية، وإدارة أداء المحرك الخلفي لمنظومة قرار.</p>
        </div>
        
        {/* 🛠️ أزرار الإدارة والتحكم الفوري الفاخرة المضافة للمطور */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => triggerDeploy(false)}
            disabled={isDeploying}
            className={`text-xs px-4 py-2 rounded-lg font-medium transition ${
              isDeploying 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-[#111A35] text-indigo-400 hover:bg-indigo-950 border border-indigo-900/60'
            }`}
          >
            {isDeploying ? 'جاري النشر...' : '🚀 نشر سريع'}
          </button>

          <button
            onClick={() => triggerDeploy(true)}
            disabled={isDeploying}
            className={`text-xs px-4 py-2 rounded-lg font-medium transition ${
              isDeploying 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-[#C3073F] text-white hover:bg-[#A30635]'
            }`}
          >
            {isDeploying ? 'جاري التطهير والبناء...' : '🔥 تطهير الكاش وبناء جديد'}
          </button>

          <button 
            onClick={() => navigate('/developer/monitoring')}
            className="text-xs bg-[#111A35] border border-[#1E294B] px-4 py-2 rounded-lg text-slate-300 hover:bg-[#1E294B]"
          >
            الرجوع للمركز الرئيسي
          </button>
        </div>
      </div>

      {/* كروت الأداء والمؤشرات اللحظية الحقيقية */}
      <ServerMetricsCard status={status} />
      
      {/* شاشة السجلات والـ Logs الحية مع إمكانية التحديث التلقائي واليدوي */}
      <LiveLogsTerminal logs={logs} onRefresh={refetch} />
    </div>
  );
};

export default RenderControlPage;
