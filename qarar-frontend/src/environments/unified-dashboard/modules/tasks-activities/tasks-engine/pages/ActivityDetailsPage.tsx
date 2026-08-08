import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { AssignVolunteersModal } from '../components/AssignVolunteersModal';
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
    currentUserId, // تم استخراجه لاستخدامه في TaskCard إذا توفر
  } = engine as any;

  // حالات التحكم بالمودالات
  const [showAddCommitteeModal, setShowAddCommitteeModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState<Task | null>(null);

  // اللجنة المحددة حالياً في التبويب (Tab)
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(null);

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

  const committees = Array.isArray(currentActivity?.committees) ? currentActivity.committees : [];
  const allTasks: Task[] = Array.isArray(engine.tasks) ? engine.tasks : [];

  // تحديد أول لجنة تلقائياً عند تحميل البيانات لأول مرة
  useEffect(() => {
    if (committees.length > 0 && !selectedCommitteeId) {
      setSelectedCommitteeId(committees[0].id);
    }
  }, [committees, selectedCommitteeId]);

  // إنشاء لجنة جديدة
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

  // إنشاء مهمة جديدة تابعة للجنة المحددة
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityId || !taskForm.title.trim() || !taskForm.due_time || !createTask || !selectedCommitteeId) return;

    const taskPayload: CreateTaskInput = {
      ...taskForm,
      activity_id: activityId,
      committee_id: selectedCommitteeId,
      max_volunteers: Number(taskForm.max_volunteers) || 1,
      due_time: new Date(taskForm.due_time).toISOString(),
    };

    const success = await createTask(taskPayload);
    if (success) {
      setShowAddTaskModal(false);
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

  // اللجنة النشطة حالياً
  const activeCommittee = committees.find((c) => c.id === selectedCommitteeId);
  const activeCommitteeTasks = allTasks.filter((t: Task) => t && t.committee_id === selectedCommitteeId);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 dir-rtl" dir="rtl">
      
      {/* شريط التشخيص والوضع الحالي */}
      <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono flex flex-wrap justify-between items-center gap-2 shadow-inner">
        <div>🆔 المعرف: <span className="text-white">{activityId || 'غير محدد'}</span></div>
        <div>⏳ التحميل: <span className="text-white">{loading ? 'جاري...' : 'مكتمل'}</span></div>
        <div>📦 البيانات: <span className="text-white">{currentActivity ? 'متوفرة ✅' : 'غير متوفرة ❌'}</span></div>
        {error && <div className="text-rose-400">🚨 الخطأ: {String(error)}</div>}
      </div>

      {/* زر العودة */}
      <div>
        <button
          onClick={() => navigate('/dashboard/tasks-activities')}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
        >
          <span>→</span> العودة إلى قائمة المهام والأنشطة
        </button>
      </div>

      {/* كارت النشاط الرئيسي */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl p-3 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
              {currentActivity?.icon || '🎯'}
            </span>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{currentActivity?.title || 'نشاط بدون عنوان'}</h1>
              {currentActivity?.description && (
                <p className="text-gray-500 text-sm mt-1">{currentActivity.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddCommitteeModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <span>+</span> إضافة لجنة جديدة
          </button>
        </div>
      </div>

      {/* شريط التبويبات للجان (Tabs Navigation Bar) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>🏛️</span> لجان النشاط
          </h2>
          <span className="text-xs text-gray-400 font-medium">إجمالي اللجان: {committees.length}</span>
        </div>

        {committees.length > 0 ? (
          <>
            {/* أزرار التبويبات */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {committees.map((committee) => {
                if (!committee) return null;
                const isSelected = committee.id === selectedCommitteeId;
                const taskCount = allTasks.filter((t: Task) => t && t.committee_id === committee.id).length;

                return (
                  <button
                    key={committee.id}
                    onClick={() => setSelectedCommitteeId(committee.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{committee.committee_name || committee.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {taskCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* عرض محتوى اللجنة المحددة حالياً */}
            {activeCommittee && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                {/* رأس اللجنة المحددة */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {activeCommittee.committee_name || activeCommittee.name}
                    </h3>
                    {activeCommittee.description && (
                      <p className="text-xs text-gray-500 mt-1">{activeCommittee.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>+</span> إضافة مهمة لهذه اللجنة
                  </button>
                </div>

                {/* قائمة مهام اللجنة المحدثة بدون زر خارجي مكرر */}
                {activeCommitteeTasks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {activeCommitteeTasks.map((task: Task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        committeeName={activeCommittee.committee_name || activeCommittee.name}
                        currentUserId={currentUserId}
                        onApply={applyForTask}
                        onExcuse={submitExcuse}
                        onAssignVolunteer={() => setSelectedTaskForAssign(task)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-8 text-center space-y-3">
                    <span className="text-3xl block">📝</span>
                    <p className="text-xs font-medium text-gray-500">لا توجد مهام مضافة لهذه اللجنة حتى الآن.</p>
                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      إضافة أول مهمة للجنة
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-4 shadow-sm">
            <span className="text-4xl block">🏛️</span>
            <div>
              <h3 className="text-sm font-bold text-gray-800">لا توجد لجان مضافة في هذا النشاط</h3>
              <p className="text-xs text-gray-400 mt-1">قم بإضافة لجان لتتمكن من تنظيم المهام وتوزيعها على المتطوعين.</p>
            </div>
            <button
              onClick={() => setShowAddCommitteeModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              + إضافة أول لجنة الآن
            </button>
          </div>
        )}
      </section>

      {/* مودال إنشاء لجنة جديدة */}
      {showAddCommitteeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">إضافة لجنة فرعية جديدة</h3>
              <button
                onClick={() => setShowAddCommitteeModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCommittee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم اللجنة *</label>
                <input
                  type="text"
                  required
                  value={committeeForm.committee_name || committeeForm.name || ''}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, committee_name: e.target.value, name: e.target.value })}
                  placeholder="مثال: لجنة التنظيم والاستقبال"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={committeeForm.description || ''}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, description: e.target.value })}
                  placeholder="وصف مختصر لمسؤوليات هذه اللجنة..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddCommitteeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  حفظ اللجنة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إنشاء مهمة جديدة للجنة المحددة */}
      {showAddTaskModal && activeCommittee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">إضافة مهمة جديدة</h3>
                <p className="text-xs text-emerald-600 font-medium">
                  تابع للجنة: {activeCommittee.committee_name || activeCommittee.name}
                </p>
              </div>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="مثال: تجهيز قاعة الاستقبال"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف التفصيلي</label>
                <textarea
                  rows={2}
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="تفاصيل ما يتوجب على المتطوعين فعله..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ ووقت الإنجاز *</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.due_time}
                    onChange={(e) => setTaskForm({ ...taskForm, due_time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العدد المطلوب من المتطوعين *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={taskForm.max_volunteers}
                    onChange={(e) => setTaskForm({ ...taskForm, max_volunteers: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  إنشاء المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تعيين المتطوعين */}
      <AssignVolunteersModal
        task={selectedTaskForAssign}
        isOpen={!!selectedTaskForAssign}
        onClose={() => setSelectedTaskForAssign(null)}
        onSuccess={() => {
          if (activityId && fetchActivityById) {
            fetchActivityById(activityId);
          }
        }}
      />
    </div>
  );
};

export default ActivityDetailsPage;
