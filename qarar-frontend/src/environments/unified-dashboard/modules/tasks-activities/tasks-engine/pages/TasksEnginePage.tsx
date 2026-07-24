import React, { useState } from 'react';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskInput, CreateActivityInput, TaskPriority, ActivityStatus } from '../types/tasks-engine.types';
import { Plus, X, FolderPlus, CheckSquare } from 'lucide-react';

export const TasksEnginePage: React.FC = () => {
  const engine = useTasksEngine();
  const { 
    tasks = [], 
    activities = [], 
    loading = false, 
    applyForTask, 
    submitExcuse, 
    createTask,
    createActivity // التأكد من وجود الدالة في الـ hook
  } = engine || {};

  const [selectedTab, setSelectedTab] = useState<'all' | 'open' | 'activities'>('all');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('');

  // 1. حالات مودال إنشاء المهمة
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [taskSubmitting, setTaskSubmitting] = useState<boolean>(false);

  const initialTaskState: CreateTaskInput = {
    title: '',
    description: '',
    activity_id: '',
    committee_id: '',
    action_type: 'standard',
    assignment_type: 'direct',
    max_volunteers: 1,
    priority: 'normal',
    due_time: '',
  };
  const [taskFormData, setTaskFormData] = useState<CreateTaskInput>(initialTaskState);

  // 2. حالات مودال إنشاء النشاط
  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [activitySubmitting, setActivitySubmitting] = useState<boolean>(false);

  const initialActivityState: CreateActivityInput = {
    title: '',
    description: '',
    status: 'planned',
    start_date: '',
    end_date: '',
  };
  const [activityFormData, setActivityFormData] = useState<CreateActivityInput>(initialActivityState);

  // حماية المصفوفات
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  // جلب اللجان للنشاط المحدد في نموذج المهمة
  const selectedActivityObj = safeActivities.find(act => act.id === taskFormData.activity_id);
  const availableCommittees = selectedActivityObj?.committees || [];

  // تصفية المهام
  const filteredTasks = safeTasks.filter((t) => {
    if (selectedActivityFilter && t?.activity_id !== selectedActivityFilter) return false;
    if (selectedTab === 'open') return t?.assignment_type === 'open_announcement';
    return true;
  });

  // معالجة إنشاء المهمة
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return alert('يرجى كتابة عنوان المهمة');
    if (!taskFormData.due_time) return alert('يرجى تحديد تاريخ ووقت التسليم النهائي');

    const payload: CreateTaskInput = {
      ...taskFormData,
      activity_id: taskFormData.activity_id || undefined,
      committee_id: taskFormData.committee_id || undefined,
      description: taskFormData.description || undefined,
    };

    setTaskSubmitting(true);
    const success = await createTask(payload);
    setTaskSubmitting(false);

    if (success) {
      setIsTaskModalOpen(false);
      setTaskFormData(initialTaskState);
    }
  };

  // معالجة إنشاء النشاط البرامجي
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityFormData.title.trim()) return alert('يرجى كتابة عنوان النشاط');

    const payload: CreateActivityInput = {
      ...activityFormData,
      description: activityFormData.description || undefined,
      start_date: activityFormData.start_date || undefined,
      end_date: activityFormData.end_date || undefined,
    };

    setActivitySubmitting(true);
    const success = createActivity ? await createActivity(payload) : false;
    setActivitySubmitting(false);

    if (success) {
      setIsActivityModalOpen(false);
      setActivityFormData(initialActivityState);
    }
  };

  return (
    <div className="p-4 md:p-6 dir-rtl text-right max-w-7xl mx-auto font-sans pb-24">
      {/* الهيدر الأكبر مع أزرار الإجراءات */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">محرك المهام والأنشطة الإدارية</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">إدارة الأنشطة واللجان وتوزيع المهام الحوكمية</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* زر إنشاء نشاط */}
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            إنشاء نشاط برامجي
          </button>

          {/* زر إنشاء مهمة */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2 bg-[#7A1C2E] hover:bg-[#560E1A] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <CheckSquare className="w-4 h-4" />
            إنشاء مهمة جديدة
          </button>
        </div>
      </div>

      {/* شريط التصفية والتبويب */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              selectedTab === 'all' ? 'bg-[#7A1C2E] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            جميع المهام ({safeTasks.length})
          </button>
          <button
            onClick={() => setSelectedTab('open')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              selectedTab === 'open' ? 'bg-[#7A1C2E] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            سوق الفرص المفتوحة
          </button>
        </div>

        <select
          value={selectedActivityFilter}
          onChange={(e) => setSelectedActivityFilter(e.target.value)}
          className="border border-gray-300 rounded-xl text-xs p-2.5 bg-white outline-none focus:ring-2 focus:ring-[#7A1C2E]"
        >
          <option value="">جميع الأنشطة البرامجية ({safeActivities.length})</option>
          {safeActivities.map((act) => (
            <option key={act?.id} value={act?.id}>
              {act?.title}
            </option>
          ))}
        </select>
      </div>

      {/* قائمة المهام */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm font-semibold animate-pulse">جاري جلب البيانات من السيرفر...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm font-bold">لا توجد مهام مطابقة حالياً.</p>
          <p className="text-gray-400 text-xs mt-1">يمكنك البدء بإنشاء نشاط برامجي أو مهمة إدارية جديدة من الأزرار أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task?.id}
              task={task}
              onApply={applyForTask}
              onExcuse={submitExcuse}
            />
          ))}
        </div>
      )}

      {/* 🟢 1. مودال إنشاء نشاط برامجي جديد */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-gray-100 my-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#7A1C2E]" />
                إضافة نشاط برامجي جديد
              </h2>
              <button 
                onClick={() => setIsActivityModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان النشاط *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ملتقى قرار التطوعي السنوي"
                  value={activityFormData.title}
                  onChange={(e) => setActivityFormData({ ...activityFormData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف والأهداف</label>
                <textarea
                  rows={3}
                  placeholder="اكتب شرحاً مختصر عن أهداف النشاط..."
                  value={activityFormData.description || ''}
                  onChange={(e) => setActivityFormData({ ...activityFormData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">حالة النشاط</label>
                <select
                  value={activityFormData.status}
                  onChange={(e) => setActivityFormData({ ...activityFormData, status: e.target.value as ActivityStatus })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                >
                  <option value="planned">مخطط له (Planned)</option>
                  <option value="active">نشط حالياً (Active)</option>
                  <option value="paused">متوقف مؤقتاً (Paused)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={activityFormData.start_date || ''}
                    onChange={(e) => setActivityFormData({ ...activityFormData, start_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={activityFormData.end_date || ''}
                    onChange={(e) => setActivityFormData({ ...activityFormData, end_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={activitySubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gray-900 hover:bg-black transition-all shadow-md disabled:opacity-50"
                >
                  {activitySubmitting ? 'جاري الحفظ...' : 'حفظ النشاط'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 2. مودال إنشاء مهمة إدارية جديدة */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl relative border border-gray-100 my-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#7A1C2E]" />
                إضافة مهمة إدارية جديدة
              </h2>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إعداد التقرير الختامي"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وصف المهمة ومتطلباتها</label>
                <textarea
                  rows={3}
                  placeholder="اكتب شرحاً للمطلوب مخرجه..."
                  value={taskFormData.description || ''}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">آلية التكليف</label>
                  <select
                    value={taskFormData.assignment_type}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assignment_type: e.target.value as 'direct' | 'open_announcement' })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="direct">تكليف مباشر</option>
                    <option value="open_announcement">فرصة مفتوحة (سوق الفرص)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مستوى الأولوية</label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as TaskPriority })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="low">منخفضة</option>
                    <option value="normal">عادية</option>
                    <option value="high">مرتفعة</option>
                    <option value="urgent">طارئة جداً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ ووقت التسليم النهائي (Due Time) *</label>
                <input
                  type="datetime-local"
                  required
                  value={taskFormData.due_time}
                  onChange={(e) => setTaskFormData({ ...taskFormData, due_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الربط بنشاط برامجي</label>
                  <select
                    value={taskFormData.activity_id || ''}
                    onChange={(e) => setTaskFormData({ ...taskFormData, activity_id: e.target.value, committee_id: '' })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="">عام (غير مرتبط بنشاط)</option>
                    {safeActivities.map((act) => (
                      <option key={act?.id} value={act?.id}>
                        {act?.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الربط بلجنة فرعية</label>
                  <select
                    disabled={!taskFormData.activity_id || availableCommittees.length === 0}
                    value={taskFormData.committee_id || ''}
                    onChange={(e) => setTaskFormData({ ...taskFormData, committee_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">عام (بدون لجنة فرعية)</option>
                    {availableCommittees.map((comm) => (
                      <option key={comm?.id} value={comm?.id}>
                        {comm?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={taskSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#7A1C2E] hover:bg-[#560E1A] transition-all shadow-md disabled:opacity-50"
                >
                  {taskSubmitting ? 'جاري الحفظ...' : 'حفظ ونشر المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
