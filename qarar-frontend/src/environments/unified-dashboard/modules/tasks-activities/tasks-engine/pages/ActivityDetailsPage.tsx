import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { Activity, Task, CreateActivityInput, CreateTaskInput } from '../types/tasks-engine.types';

export const TasksActivitiesPage: React.FC = () => {
  const navigate = useNavigate();

  const engine = useTasksEngine() || {};
  const {
    tasks = [],
    activities = [],
    loading = false,
    error = null,
    fetchTasks,
    fetchActivities,
    createActivity,
    createTask,
    applyForTask = async () => false,
    submitExcuse = async () => false,
    currentUserId = undefined,
  } = engine;

  const [activeTab, setActiveTab] = useState<'my_tasks' | 'market' | 'activities'>('my_tasks');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [activityForm, setActivityForm] = useState<CreateActivityInput>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    icon: '🎯',
  });

  const [taskForm, setTaskForm] = useState<CreateTaskInput>({
    title: '',
    description: '',
    due_time: '',
    max_volunteers: 1,
    priority: 'normal',
    assignment_type: 'open_announcement',
  });

  useEffect(() => {
    if (fetchTasks) fetchTasks();
    if (fetchActivities) fetchActivities();
  }, [fetchTasks, fetchActivities]);

  const safeTasks: Task[] = Array.isArray(tasks) ? tasks : [];
  const safeActivities: Activity[] = Array.isArray(activities) ? activities : [];

  const myTasks = safeTasks.filter((task) =>
    task.assignments?.some((a) => a.volunteer_id === currentUserId)
  );

  const openMarketTasks = safeTasks.filter(
    (task) =>
      task.assignment_type === 'open_announcement' &&
      !task.assignments?.some((a) => a.volunteer_id === currentUserId)
  );

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title.trim() || !activityForm.start_date || !activityForm.end_date || !createActivity) return;
    const success = await createActivity(activityForm);
    if (success) {
      setShowActivityModal(false);
      setActivityForm({ title: '', description: '', start_date: '', end_date: '', icon: '🎯' });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.due_time || !createTask) return;
    const success = await createTask({ ...taskForm, max_volunteers: Number(taskForm.max_volunteers) });
    if (success) {
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', due_time: '', max_volunteers: 1, priority: 'normal', assignment_type: 'open_announcement' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 dir-rtl" dir="rtl">
      {/* شريط العناوين الأزرار الإدارية */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="p-2 bg-red-50 text-[#7A1C2E] rounded-2xl text-2xl">📋</span>
            مركز المهام والأنشطة البرامجية
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            متابعة المهام المباشرة، الانضمام لسوق الفرص التطوعية، وإدارة الأنشطة واللجان التنفيذية.
          </p>
        </div>

        {/* أزرار الإضافة السريعة */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowTaskModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            + إضافة مهمة
          </button>
          <button
            type="button"
            onClick={() => setShowActivityModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#7A1C2E] hover:bg-[#601624] text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            + إضافة نشاط / لجنة
          </button>
        </div>
      </div>

      {/* أزرار التبويبات */}
      <div className="flex items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl w-full">
        <button
          type="button"
          onClick={() => setActiveTab('my_tasks')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'my_tasks' ? 'bg-[#7A1C2E] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 مهامي ({myTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('market')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'market' ? 'bg-[#7A1C2E] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏪 سوق الفرص ({openMarketTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'activities' ? 'bg-[#7A1C2E] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎪 الأنشطة ({safeActivities.length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold">
          🚨 تعذر جلب البيانات: {String(error)}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl text-gray-400 text-sm font-bold animate-pulse">
          ⏳ جاري جلب المهام والأنشطة...
        </div>
      ) : (
        <>
          {activeTab === 'my_tasks' && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C2E]"></span>
                المهام المسندة إليك حالياً
              </h2>
              {myTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myTasks.map((task) => (
                    <TaskCard key={task.id} task={task} currentUserId={currentUserId} onApply={applyForTask} onExcuse={submitExcuse} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 text-sm">
                  لا توجد مهام مسندة إليك حالياً.
                </div>
              )}
            </section>
          )}

          {activeTab === 'market' && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C2E]"></span>
                الفرص التطوعية المتاحة للتقديم المباشر
              </h2>
              {openMarketTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {openMarketTasks.map((task) => (
                    <TaskCard key={task.id} task={task} currentUserId={currentUserId} onApply={applyForTask} onExcuse={submitExcuse} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 text-sm">
                  لا توجد فرص تطوعية معلنة حالياً.
                </div>
              )}
            </section>
          )}

          {activeTab === 'activities' && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C2E]"></span>
                قائمة الأنشطة والفعاليات
              </h2>
              {safeActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {safeActivities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => navigate(`/dashboard/tasks-activities/activities/${activity.id}`)}
                      className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-[#7A1C2E]/40 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl p-2 bg-red-50 text-[#7A1C2E] rounded-2xl">{activity.icon || '🎯'}</span>
                          <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-red-50 text-[#7A1C2E] border border-red-100">
                            {activity.status === 'active' ? 'نشط' : activity.status || 'مخطط'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-2">{activity.title}</h3>
                        {activity.description && <p className="text-gray-500 text-xs line-clamp-2 mb-4">{activity.description}</p>}
                      </div>
                      <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-[#7A1C2E] font-bold">
                        <span>عرض التفاصيل واللجان</span>
                        <span>←</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 text-sm">
                  لم يتم إضافة أي أنشطة بعد.
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* مودال إنشاء نشاط */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إنشاء نشاط برامجي جديد</h3>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم النشاط *</label>
                <input
                  type="text"
                  required
                  value={activityForm.title ?? ''}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#7A1C2E] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وصف النشاط</label>
                <textarea
                  rows={2}
                  value={activityForm.description ?? ''}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#7A1C2E] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ البداية *</label>
                  <input
                    type="date"
                    required
                    value={activityForm.start_date ?? ''}
                    onChange={(e) => setActivityForm({ ...activityForm, start_date: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ النهاية *</label>
                  <input
                    type="date"
                    required
                    value={activityForm.end_date ?? ''}
                    onChange={(e) => setActivityForm({ ...activityForm, end_date: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowActivityModal(false)} className="px-4 py-2 text-xs text-gray-600 rounded-xl">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-xs bg-[#7A1C2E] text-white rounded-xl font-bold">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إنشاء مهمة */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إنشاء مهمة جديدة</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title ?? ''}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#7A1C2E] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">التفاصيل</label>
                <textarea
                  rows={2}
                  value={taskForm.description ?? ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#7A1C2E] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ الموعد *</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.due_time ?? ''}
                    onChange={(e) => setTaskForm({ ...taskForm, due_time: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الحد الأقصى للمتطوعين *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={taskForm.max_volunteers ?? 1}
                    onChange={(e) => setTaskForm({ ...taskForm, max_volunteers: Number(e.target.value) })}
                    className="w-full border rounded-xl p-2.5 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-xs text-gray-600 rounded-xl">إلغاء</button>
                <button type="submit" className="px-4 py-2 text-xs bg-[#7A1C2E] text-white rounded-xl font-bold">نشر المهمة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksActivitiesPage;
