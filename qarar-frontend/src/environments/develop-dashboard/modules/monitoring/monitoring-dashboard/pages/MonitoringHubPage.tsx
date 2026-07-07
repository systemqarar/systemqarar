import React from 'react';
import { useNavigate } from 'react-router-dom';

const MonitoringHubPage: React.FC = () => {
  const navigate = useNavigate();

  const activeSystems = [
    {
      id: 'render',
      name: 'Render API Engine',
      desc: 'السيرفر الخلفي وقواعد البيانات اللحظية للمنظومة.',
      status: 'نشط الآن',
      color: 'text-emerald-400',
      dotColor: 'bg-emerald-500',
      clickable: true,
      path: '/developer/monitoring/render'
    },
    {
      id: 'vercel',
      name: 'Vercel Front-End',
      desc: 'بنية استضافة واجهات المستخدم التفاعلية للقرار الذكي.',
      status: 'قريباً',
      color: 'text-amber-400',
      dotColor: 'bg-amber-500',
      clickable: false,
      path: '#'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp OTP (Baileys)',
      desc: 'محرك أتمتة رسائل التحقق النصية الدولية للمتطوعين.',
      status: 'قريباً',
      color: 'text-amber-400',
      dotColor: 'bg-amber-500',
      clickable: false,
      path: '#'
    },
    {
      id: 'database',
      name: 'PostgreSQL Cluster',
      desc: 'سلامة الجداول والـ Connection Pools وحالة النسخ الاحتياطي.',
      status: 'قريباً',
      color: 'text-amber-400',
      dotColor: 'bg-amber-500',
      clickable: false,
      path: '#'
    }
  ];

  return (
    <div className="p-6 space-y-6 font-sans text-white">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">مركز المراقبة والتحكم المركزي (Monitoring Hub)</h1>
        <p className="text-xs text-slate-400 mt-1">حالة البنية التحتية لجميع الخدمات والأنظمة المرتبطة بالقرار الذكي.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeSystems.map((sys) => (
          <div 
            key={sys.id}
            onClick={() => sys.clickable && navigate(sys.path)}
            className={`bg-[#111A35] border border-[#1E294B] p-5 rounded-2xl flex flex-col justify-between transition-all ${
              sys.clickable ? 'cursor-pointer hover:border-[#C3073F] hover:shadow-lg' : 'opacity-60 select-none'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-200">{sys.name}</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#070C1E] border border-[#1E294B]">
                  <span className={`w-2 h-2 rounded-full ${sys.dotColor} ${sys.clickable && 'animate-pulse'}`}></span>
                  <span className={`text-[10px] font-medium ${sys.color}`}>{sys.status}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{sys.desc}</p>
            </div>
            
            {sys.clickable && (
              <div className="mt-6 flex justify-end text-xs text-[#C3073F] font-bold items-center gap-1">
                دخول لوحة التحكم التفصيلية &larr;
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonitoringHubPage;
