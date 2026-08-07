import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { Activity, CreateActivityInput, CreateTaskInput, Task } from '../types/tasks-engine.types';

export const TasksEnginePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activities = [],
    tasks = [],
    loading,
    error,
    createActivity,
    createTask,
    applyForTask,
    submitExcuse,
  } = useTasksEngine();

  // التبويب الحالي: الأنشطة البرامجية أم المهام المستقلة
  const [activeTab, setActiveTab] = useState<'activities' | 'standalone_tasks'>('activities');

  // النوافذ المنبثقة
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // نماذج الإنشاء
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

  // إنشاء نشاط جديد
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title.trim() || !activityForm.start_date || !activityForm.end_date) return;

    const success = await createActivity(activityForm);
    if (success) {
      setShowActivityModal(false);
      setActivityForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        icon: '🎯',
      });
    }
  };

  // إنشاء مهمة مستقلة جديدة
  const handleCreateStandaloneTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.due_time) return;

    const success = await createTask({
      ...taskForm,
      activity_id: undefined,
      committee_id: undefined,
      max_volunteers: Number(taskForm.max_volunteers),
    });

    if (success) {
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        due_time: '',
        max_volunteers: 1,
        priority: 'normal',
        assignment_type: 'open_announcement',
      });
    }
  };

  // تصفية المهام المستقلة (التي ليس لها activity_id)
  const safeTasks: Task[] = tasks || [];
  const safeActivities: Activity[] = activities || [];
  const standaloneTasks = safeTasks.filter((task: Task) => !task.activity_id);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 dir-rtl" dir="rtl">
      {/* هيدر الصفحة الرئيسي */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المهام والأنشطة</h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة الأنشطة البرامجية، اللجان، وسوق الفرص والمهام التطوعية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-colors"
          >
            + إضافة مهمة مستقلة
          </button>
          <button
            onClick={() => setShowActivityModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            + إنشاء نشاط برامجي
          </button>
        </div>
      </div>

      {/* شريط التبويبات */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'activities'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🎯 الأنشطة البرامجية ({safeActivities.length})
        </button>
        <button
          onClick={() => setActiveTab('standalone_tasks')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'standalone_tasks'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📌 سوق المهام المستقلة ({standaloneTasks.length})
        </button>
      </div>

      {/* رسالة الخطأ أو التحميل */}
      {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">{error}</div>}

      {/* محتوى تبويب الأنشطة */}
      {activeTab === 'activities' && (
        <div>
          {loading && safeActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm animate-pulse">جاري تحميل الأنشطة البرامجية...</div>
          ) : safeActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeActivities.map((activity: Activity) => (
                <div
                  key={activity.id}
                  onClick={() => navigate(`/tasks-activities/activities/${activity.id}`)}
                  className="bg-white border border-gray-200 hover:border-emerald-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-3xl p-2 bg-emerald-50 rounded-xl">{activity.icon || '🎯'}</span>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
                        {activity.status === 'active' ? 'نشط' : activity.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2">
                      {activity.title}
                    </h3>
                    {activity.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">{activity.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                    <span>
                      🗓 {activity.start_date ? new Date(activity.start_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </span>
                    <span className="text-emerald-600 font-bold group-hover:translate-x-[-2px] transition-transform">
                      عرض التفاصيل واللجان ←
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500 text-sm">
              لا يوجد أنشطة برامجية مسجلة حالياً. قم بإنشاء نشاطك الأول لبدء توزيع اللجان والمهام.
            </div>
          )}
        </div>
      )}

      {/* محتوى تبويب المهام المستقلة */}
      {activeTab === 'standalone_tasks' && (
        <div>
          {loading && standaloneTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm animate-pulse">جاري تحميل سوق المهام...</div>
          ) : standaloneTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {standaloneTasks.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onApply={applyForTask}
                  onExcuse={submitExcuse}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500 text-sm">
              لا توجد مهام مستقلة معروضة حالياً في سوق المهام.
            </div>
          )}
        </div>
      )}

      {/* نافذة إنشاء نشاط */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إنشاء نشاط برامجي جديد</h3>
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم النشاط *</label>
                <input
                  type="text"
                  required
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  placeholder="مثال: ملتقى المتطوعين السنوي"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وصف النشاط</label>
                <textarea
                  rows={2}
                  value={activityForm.description || ''}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="وصف المختصر وأهداف النشاط..."
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ البداية *</label>
                  <input
                    type="date"
                    required
                    value={activityForm.start_date}
                    onChange={(e) => setActivityForm({ ...activityForm, start_date: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ النهاية *</label>
                  <input
                    type="date"
                    required
                    value={activityForm.end_date}
                    onChange={(e) => setActivityForm({ ...activityForm, end_date: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  حفظ النشاط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إنشاء مهمة مستقلة */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إنشاء مهمة مستقلة جديدة</h3>
            <form onSubmit={handleCreateStandaloneTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="مثال: إعداد تقرير المصروفات"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">التفاصيل ومتطلبات المهمة</label>
                <textarea
                  rows={2}
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="شرح المطلوب تنفيذه..."
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ الموعد *</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.due_time}
                    onChange={(e) => setTaskForm({ ...taskForm, due_time: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الحد الأقصى للمتطوعين *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={taskForm.max_volunteers}
                    onChange={(e) => setTaskForm({ ...taskForm, max_volunteers: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الأولوية</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="normal">عادي</option>
                  <option value="high">عالي الأهمية</option>
                  <option value="urgent">عاجل طارئ</option>
                  <option value="low">منخفض</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  نشر المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
