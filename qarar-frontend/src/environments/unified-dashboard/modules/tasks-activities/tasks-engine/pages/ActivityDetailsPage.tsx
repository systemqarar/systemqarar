import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { AssignVolunteerModal } from '../components/AssignVolunteerModal';
import { CreateCommitteeInput, CreateTaskInput, Task } from '../types/tasks-engine.types';

export const ActivityDetailsPage: React.FC = () => {
  const { id: activityId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const engine = useTasksEngine() || {};
  const {
    currentActivity = null,
    loading = false,
    error = null,
    fetchActivityById,
    addCommittee,
    createTask,
    applyForTask = () => {},
    submitExcuse = () => {},
  } = engine;

  // حالات فتح وإغلاق المودالات
  const [showAddCommitteeModal, setShowAddCommitteeModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState<Task | null>(null);

  const [activeCommitteeId, setActiveCommitteeId] = useState<string | undefined>(undefined);

  // نماذج الإدخال
  const [committeeForm, setCommitteeForm] = useState<CreateCommitteeInput>({
    committee_name: '',
    name: '',
    description: '',
  });

  const [taskForm, setTaskForm] = useState<Omit<CreateTaskInput, 'activity_id' | 'committee_id'>>({
    title: '',
    description: '',
    due_time: '',
    max_volunteers: 1,
    priority: 'normal',
    assignment_type: 'open_announcement',
  });

  useEffect(() => {
    if (activityId) {
      if (fetchActivityById) fetchActivityById(activityId);
      if (engine.fetchTasks) engine.fetchTasks({ activity_id: activityId });
    }
  }, [activityId, fetchActivityById, engine.fetchTasks]);

  // دالة إنشاء لجنة
  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = committeeForm.committee_name || committeeForm.name || '';
    if (!activityId || !name.trim() || !addCommittee) return;

    const success = await addCommittee(activityId, committeeForm);
    if (success) {
      setShowAddCommitteeModal(false);
      setCommitteeForm({ committee_name: '', name: '', description: '' });
    }
  };

  // دالة إنشاء مهمة
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityId || !taskForm.title.trim() || !taskForm.due_time || !createTask) return;

    const taskPayload: CreateTaskInput = {
      ...taskForm,
      activity_id: activityId,
      committee_id: activeCommitteeId,
      max_volunteers: Number(taskForm.max_volunteers) || 1,
      due_time: new Date(taskForm.due_time).toISOString(),
    };

    const success = await createTask(taskPayload);
    if (success) {
      setShowAddTaskModal(false);
      setActiveCommitteeId(undefined);
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

  const allTasks: Task[] = Array.isArray(engine.tasks) ? engine.tasks : [];
  const standaloneTasks = allTasks.filter((t: Task) => t && !t.committee_id);
  const committees = Array.isArray(currentActivity?.committees) ? currentActivity.committees : [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 dir-rtl" dir="rtl">
      {/* شريط التشخيص والخطأ */}
      <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono flex flex-wrap justify-between items-center gap-2">
        <div>🆔 المعرف: <span className="text-white">{activityId || 'غير محدد'}</span></div>
        <div>⏳ التحميل: <span className="text-white">{loading ? 'جاري...' : 'مكتمل'}</span></div>
        <div>📦 البيانات: <span className="text-white">{currentActivity ? 'متوفرة ✅' : 'غير متوفرة ❌'}</span></div>
        {error && <div className="text-rose-400">🚨 الخطأ: {String(error)}</div>}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/tasks-activities')}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <span>→</span> العودة إلى قائمة المهام والأنشطة
        </button>
      </div>

      {/* تفاصيل النشاط الهيدر */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 bg-emerald-50 rounded-xl">{currentActivity?.icon || '🎯'}</span>
              <h1 className="text-2xl font-bold text-gray-900">{currentActivity?.title || 'نشاط بدون عنوان'}</h1>
            </div>
            {currentActivity?.description && (
              <p className="text-gray-600 text-sm mt-2">{currentActivity.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddCommitteeModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold"
            >
              + إضافة لجنة
            </button>
            <button
              onClick={() => {
                setActiveCommitteeId(undefined);
                setShowAddTaskModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              + إضافة مهمة للنشاط
            </button>
          </div>
        </div>
      </div>

      {/* عرض اللجان */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">🏛️ اللجان الفرعية</h2>
        {committees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {committees.map((committee) => {
              if (!committee) return null;
              const committeeTasks = allTasks.filter((t: Task) => t && t.committee_id === committee.id);
              return (
                <div key={committee.id} className="bg-gray-50 border rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold">{committee.committee_name || committee.name}</h3>
                    <button
                      onClick={() => {
                        setActiveCommitteeId(committee.id);
                        setShowAddTaskModal(true);
                      }}
                      className="px-3 py-1.5 bg-white border text-xs rounded-xl font-bold text-gray-700 hover:bg-gray-100"
                    >
                      + إضافة مهمة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {committeeTasks.map((task: Task) => (
                      <div key={task.id} className="space-y-2">
                        <TaskCard task={task} onApply={applyForTask} onExcuse={submitExcuse} />
                        <button
                          type="button"
                          onClick={() => setSelectedTaskForAssign(task)}
                          className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          👤 + إضافة متطوع للمهمة
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-dashed rounded-2xl p-6 text-center text-gray-500 text-xs">
            لا توجد لجان مضافة حتى الآن.
          </div>
        )}
      </section>

      {/* المهام العامة */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">📌 المهام العامة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standaloneTasks.map((task: Task) => (
            <div key={task.id} className="space-y-2">
              <TaskCard task={task} onApply={applyForTask} onExcuse={submitExcuse} />
              <button
                type="button"
                onClick={() => setSelectedTaskForAssign(task)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
              >
                👤 + إضافة متطوع للمهمة
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* مودال إنشاء لجنة */}
      {showAddCommitteeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إضافة لجنة فرعية جديدة</h3>
            <form onSubmit={handleCreateCommittee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم اللجنة *</label>
                <input
                  type="text"
                  required
                  value={committeeForm.committee_name || committeeForm.name || ''}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, committee_name: e.target.value, name: e.target.value })}
                  placeholder="مثال: لجنة التنظيم"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={committeeForm.description || ''}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, description: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddCommitteeModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  حفظ اللجنة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إنشاء مهمة */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {activeCommitteeId ? 'إضافة مهمة جديدة للجنة' : 'إضافة مهمة جديدة للنشاط'}
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">التاريخ *</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.due_time}
                    onChange={(e) => setTaskForm({ ...taskForm, due_time: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العدد المطلوب *</label>
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
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTaskModal(false);
                    setActiveCommitteeId(undefined);
                  }}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  إنشاء المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إسناد متطوع للمهمة */}
      <AssignVolunteerModal
        task={selectedTaskForAssign}
        isOpen={!!selectedTaskForAssign}
        onClose={() => setSelectedTaskForAssign(null)}
      />
    </div>
  );
};

// حل مشكلة الاستيراد المباشر والافتراضي (TS2613)
export default ActivityDetailsPage;
