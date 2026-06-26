import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Calendar, CheckCircle2, Clock, AlertTriangle, 
  UploadCloud, Bell, User, Filter, FileText, Home, MessageSquare, 
  Check, Circle
} from 'lucide-react';

// تزييف بيانات المكاتب السبعة لخدمة العرض التفاعلي
const ADMINISTRATIVE_OFFICES = [
  { id: 'all', name: 'كل المكاتب' },
  { id: 'social', name: 'الخدمات الاجتماعية' },
  { id: 'training', name: 'التدريب والتطوير' },
  { id: 'media', name: 'المكتب الإعلامي' },
  { id: 'emergency', name: 'الطوارئ والعمليات' },
  { id: 'women', name: 'المرأة والتطوير' },
  { id: 'finance', name: 'الأمانة المالية' },
  { id: 'secretariat', name: 'السكرتارية التنفيذية' },
];

// تزييف بيانات المهام الميدانية القادمة من المكاتب
const MOCK_TASKS = [
  {
    id: 'task-1',
    title: 'حصر وفحص أسر المتطوعين المتأثرة بالقطاع الجنوبي',
    officeId: 'social',
    officeName: 'مكتب الخدمات الاجتماعية',
    priority: 'high',
    status: 'pending',
    date: '2026-06-28',
    description: 'تنفيذ زيارات ميدانية سريعة لتوثيق الاحتياجات العاجلة ورفعها لقاعدة البيانات قبل المساء.'
  },
  {
    id: 'task-2',
    title: 'تجهيز قاعة التدريب لدورة TOT القادمة',
    officeId: 'training',
    officeName: 'مكتب التدريب والتطوير',
    priority: 'medium',
    status: 'in-progress',
    date: '2026-06-30',
    description: 'مراجعة المعينات البصرية، كشوفات الحضور المعتمدة، والتأكد من تفعيل أجهزة العرض.'
  },
  {
    id: 'task-3',
    title: 'توثيق توزيع المساعدات الإنسانية بالوحدة الإدارية',
    officeId: 'media',
    officeName: 'المكتب الإعلامي',
    priority: 'high',
    status: 'completed',
    date: '2026-06-26',
    description: 'التقاط صور ومقاطع بجودة عالية لإعداد التقرير الصحفي اليومي وبثه على المنصات الرسمية.'
  },
  {
    id: 'task-4',
    title: 'تحديث خطة الإخلاء والاستجابة السريعة للميدان',
    officeId: 'emergency',
    officeName: 'مكتب الطوارئ والعمليات',
    priority: 'high',
    status: 'pending',
    date: '2026-06-29',
    description: 'مراجعة نقاط التجمع الآمنة مع المتطوعين وتوزيع أجهزة اللاسلكي حسب الخطة الجديدة.'
  }
];

export const FieldTasks: React.FC = () => {
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [activeTab, setActiveTab] = useState('tasks');
  const [reportingTask, setReportingTask] = useState<typeof MOCK_TASKS[0] | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportText, setReportText] = useState('');

  const filteredTasks = selectedOffice === 'all' 
    ? tasks 
    : tasks.filter(t => t.officeId === selectedOffice);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const nextStatus = task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending';
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setIsSubmittingReport(true);
    
    setTimeout(() => {
      setTasks(prev => prev.map(t => t.id === reportingTask?.id ? { ...t, status: 'completed' } : t));
      setIsSubmittingReport(false);
      setReportingTask(null);
      setReportText('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-gray-50 to-white flex flex-col font-sans text-right pb-28 relative overflow-hidden select-none" dir="rtl">
      
      <div className="absolute top-[-10%] right-[-20%] w-[350px] h-[350px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-20%] w-[300px] h-[300px] bg-slate-400/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/60 px-5 py-4 flex items-center justify-between shadow-[0_2px_20px_-5px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <motion.div whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/10 flex items-center justify-center text-white shadow-sm font-black text-sm">
            ق
          </motion.div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-wide">منظومة قرار</h2>
            <p className="text-[10px] text-red-600 font-bold">الهلال الأحمر السوداني</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.92 }} className="w-10 h-10 rounded-xl bg-gray-100/80 border border-gray-200/50 flex items-center justify-center text-slate-700 relative">
            <Bell className="w-4 h-4 stroke-[2.5]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          </motion.button>
        </div>
      </header>

      <main className="px-5 pt-6 space-y-6 relative z-10 max-w-md mx-auto w-full">
        
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-slate-900 tracking-tight"
          >
            المهام والأنشطة الميدانية
          </motion.h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
            جدول المتابعة الشامل للتكليفات الموكلة إليك من قبل إدارة السبعة مكاتب، مع إمكانية رفع التقارير الدورية فور إنجاز العمل الميداني.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/60 p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-red-50/50 rounded-2xl border border-red-100/50">
            <span className="text-xs text-slate-500 font-bold block">انتظار</span>
            <span className="text-xl font-black text-red-700 mt-0.5 block">{tasks.filter(t=>t.status==='pending').length}</span>
          </div>
          <div className="p-2 bg-amber-50/50 rounded-2xl border border-amber-100/50">
            <span className="text-xs text-slate-500 font-bold block">مستمرة</span>
            <span className="text-xl font-black text-amber-600 mt-0.5 block">{tasks.filter(t=>t.status==='in-progress').length}</span>
          </div>
          <div className="p-2 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
            <span className="text-xs text-slate-500 font-bold block">مكتملة</span>
            <span className="text-xl font-black text-emerald-700 mt-0.5 block">{tasks.filter(t=>t.status==='completed').length}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 px-1">
            <Filter className="w-3.5 h-3.5 text-red-600" />
            <span>تصفية حسب مكتب الإدارة المختص:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x" dir="rtl">
            {ADMINISTRATIVE_OFFICES.map((office) => {
              const isSelected = selectedOffice === office.id;
              return (
                <motion.button
                  key={office.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedOffice(office.id)}
                  className={`snap-center shrink-0 px-4 py-2.5 rounded-full text-xs font-black transition-all duration-300 shadow-sm border ${
                    isSelected 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/10' 
                      : 'bg-white text-slate-600 border-gray-200/80 hover:bg-gray-50'
                  }`}
                >
                  {office.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="bg-white/60 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 p-8 text-center"
              >
                <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">لا توجد تكليفات ميدانية نشطة حالياً لهذا المكتب</p>
              </motion.div>
            ) : (
              filteredTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white/80 backdrop-blur-md rounded-3xl border p-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.03)] space-y-4 relative overflow-hidden transition-all duration-300 ${
                    task.status === 'completed' ? 'border-emerald-200/80 bg-white/40 opacity-75' : 'border-gray-200/70'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                      {task.officeName}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {task.priority === 'high' && task.status !== 'completed' && (
                        <span className="flex items-center gap-0.5 text-[9px] font-black text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" /> طارئ جداً
                        </span>
                      )}
                      
                      <span className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-emerald-600' : task.status === 'in-progress' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className={`text-sm font-black text-slate-900 leading-snug ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100/80 pt-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <Calendar className="w-3.5 h-3.5 stroke-[2]" />
                      <span className="font-mono">{task.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-colors duration-200 ${
                          task.status === 'completed' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : task.status === 'in-progress'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-gray-50 border-gray-200 text-slate-500'
                        }`}
                        title="تبديل حالة المهمة"
                      >
                        {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : task.status === 'in-progress' ? <Clock className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </motion.button>

                      {task.status !== 'completed' && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setReportingTask(task)}
                          className="px-3 py-2 text-xs font-black bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-xl shadow-md flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>رفع تقرير</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {reportingTask && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportingTask(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[2.5rem] border-t border-gray-200 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] z-50 p-6 space-y-5"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

              <div className="text-right">
                <span className="text-[10px] font-black bg-red-50 border border-red-100 text-red-700 px-2.5 py-1 rounded-lg">
                  {reportingTask.officeName}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2 leading-snug">{reportingTask.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">اكتب خلاصة ما تم في الميدان لتثبيته في قاعدة البيانات الفورية.</p>
              </div>

              <form onSubmit={handleSendReport} className="space-y-4">
                <div className="space-y-1.5">
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    required
                    rows={4}
                    className="w-full p-4 bg-slate-50 border border-gray-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-red-700 focus:bg-white focus:ring-4 focus:ring-red-700/5 transition-all duration-300 resize-none shadow-inner"
                    placeholder="اكتب تفاصيل الإنجاز الميداني، الملاحظات، أو أي معوقات واجهت الفريق هنا..."
                  />
                </div>

                <div className="border border-dashed border-gray-200 rounded-2xl p-3 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-xl border border-gray-100 text-slate-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-700">إرفاق اللقطات الميدانية</p>
                      <p className="text-[9px] text-slate-400">صور الفحص أو مستندات الاستلام</p>
                    </div>
                  </div>
                  <button type="button" className="text-[11px] font-black text-red-700 hover:underline bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm">
                    اختيار ملف
                  </button>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmittingReport}
                    className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black py-3.5 rounded-2xl text-xs shadow-md flex justify-center items-center gap-1.5"
                  >
                    {isSubmittingReport ? (
                      <span>جاري تشفير ورفع البيانات...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>اعتماد وإرسال التقرير للإدارة</span>
                      </>
                    )}
                  </motion.button>
                  
                  <button
                    type="button"
                    onClick={() => setReportingTask(null)}
                    className="px-4 bg-gray-100 text-slate-600 border border-gray-200 font-bold rounded-2xl text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] z-40 p-2 flex justify-between items-center px-4">
        {[
          { id: 'home', name: 'الرئيسية', icon: Home },
          { id: 'profile', name: 'الملف الشخصي', icon: User },
          { id: 'tasks', name: 'المهام والأنشطة', icon: ClipboardList, badge: true },
          { id: 'ghaith', name: 'مركز التواصل', icon: MessageSquare },
          { id: 'docs', name: 'الوثائق', icon: FileText },
        ].map((tab) => {
          const isTabActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 relative ${
                isTabActive 
                  ? 'text-red-700 font-black bg-red-50/70 border border-red-100/40 shadow-inner' 
                  : 'text-slate-400 font-bold hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 stroke-[2.2] transition-transform ${isTabActive ? 'scale-105 stroke-[2.5]' : ''}`} />
                {tab.badge && (
                  <span className="absolute top-[-2px] right-[-3px] w-1.5 h-1.5 bg-red-600 rounded-full" />
                )}
              </div>
              <span className="text-[9px] mt-1 tracking-tight">{tab.name}</span>
            </motion.button>
          );
        })}
      </nav>

    </div>
  );
};

export default FieldTasks;
