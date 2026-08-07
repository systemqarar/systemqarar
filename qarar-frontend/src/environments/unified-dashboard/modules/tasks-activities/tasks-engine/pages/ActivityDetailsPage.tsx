import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { CreateCommitteeInput, CreateTaskInput } from '../types/tasks-engine.types';

export const ActivityDetailsPage: React.FC = () => {
  const { id: activityId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentActivity,
    loading,
    error,
    fetchActivityById,
    addCommittee,
    createTask,
    applyForTask,
    submitExcuse,
  } = useTasksEngine();

  // حالات فتح/إغلاق النوافذ المنبثقة
  const [showAddCommitteeModal, setShowAddCommitteeModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // نماذج الإدخال
  const [committeeForm, setCommitteeForm] = useState<CreateCommitteeInput>({
    committee_name: '',
    description: '',
  });

  const [taskForm, setTaskForm] = useState<CreateTaskInput>({
    title: '',
    description: '',
    due_time: '',
    max_volunteers: 1,
    priority: 'normal',
    assignment_type: 'open_announcement',
    activity_id: activityId,
    committee_id: undefined,
  });

  useEffect(() => {
    if (activityId) {
      fetchActivityById(activityId);
    }
  }, [activityId, fetchActivityById]);

  // إنشاء لجنة جديدة
  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityId || !committeeForm.committee_name.trim()) return;

    const success = await addCommittee(activityId, committeeForm);
    if (success) {
      setShowAddCommitteeModal(false);
      setCommitteeForm({ committee_name: '', description: '' });
    }
  };

  // إنشاء مهمة جديدة
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityId || !taskForm.title.trim() || !taskForm.due_time) return;

    const success = await createTask({
      ...taskForm,
      activity_id: activityId,
      max_volunteers: Number(taskForm.max_volunteers),
    });

    if (success) {
      setShowAddTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        due_time: '',
        max_volunteers: 1,
        priority: 'normal',
        assignment_type: 'open_announcement',
        activity_id: activityId,
        committee_id: undefined,
      });
    }
  };

  if (loading && !currentActivity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 font-medium animate-pulse">جاري تحميل تفاصيل النشاط...</div>
      </div>
    );
  }

  if (error || !currentActivity) {
    return (
      <div className="p-6 text-center">
        <div className="text-rose-600 font-bold mb-4">{error || 'النشاط غير موجود'}</div>
        <button
          onClick={() => navigate('/tasks-activities')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          العودة لإدارة المهام والأنشطة
        </button>
      </div>
    );
  }

  // تصفية المهام المستقلة المباشرة للنشاط (بدون لجنة)
  const standaloneTasks = currentActivity.tasks?.filter((t) => !t.committee_id) || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 dir-rtl" dir="rtl">
      {/* رأس الصفحة والهيدر الرئيسي للنشاط */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentActivity.icon || '🎯'}</span>
              <h1 className="text-2xl font-bold text-gray-900">{currentActivity.title}</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentActivity.status === 'active' ? 'نشط الان' : currentActivity.status}
              </span>
            </div>
            {currentActivity.description && (
              <p className="text-gray-600 text-sm mt-2">{currentActivity.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddCommitteeModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-colors"
            >
              + إضافة لجنة جديدة
            </button>
            <button
              onClick={() => {
                setTaskForm((prev) => ({ ...prev, committee_id: undefined }));
                setShowAddTaskModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              + إضافة مهمة للنشاط
            </button>
          </div>
        </div>

        {/* معلومات سريعة */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-500">
          <div>🗓 البداية: {new Date(currentActivity.start_date).toLocaleDateString('ar-SA')}</div>
          <div>🏁 النهاية: {new Date(currentActivity.end_date).toLocaleDateString('ar-SA')}</div>
          <div>👥 عدد اللجان: {currentActivity.committees?.length || 0}</div>
          <div>📋 إجمالي المهام: {currentActivity.tasks?.length || 0}</div>
        </div>
      </div>

      {/* 1. قسم اللجان الفرعية في النشاط */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🏛️</span> اللجان الفرعية للنشاط
          </h2>
        </div>

        {currentActivity.committees && currentActivity.committees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentActivity.committees.map((committee) => {
              const committeeTasks = currentActivity.tasks?.filter(
                (t) => t.committee_id === committee.id
              ) || [];

              return (
                <div key={committee.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-gray-800">{committee.committee_name}</h3>
                      {committee.description && (
                        <p className="text-xs text-gray-500 mt-1">{committee.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setTaskForm((prev) => ({ ...prev, committee_id: committee.id }));
                        setShowAddTaskModal(true);
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-xs rounded-lg text-gray-700 font-medium"
                    >
                      + إضافة مهمة للجنة
                    </button>
                  </div>

                  {/* قائمة مهام اللجنة */}
                  <div className="space-y-3 pt-2">
                    {committeeTasks.length > 0 ? (
                      committeeTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onApply={applyForTask}
                          onExcuse={submitExcuse}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
                        لا توجد مهام داخل هذه اللجنة حالياً
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 text-sm">
            لم يتم إنشاء أي لجان لهذا النشاط بعد. يمكنك إضافة لجنة لتنظيم فريق العمل.
          </div>
        )}
      </section>

      {/* 2. قسم المهام المستقلة للنشاط (غير التابعة للجنة) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📌</span> المهام العامة / المباشرة للنشاط
        </h2>

        {standaloneTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {standaloneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onApply={applyForTask}
                onExcuse={submitExcuse}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 text-sm">
            لا توجد مهام عامة مباشرة للنشاط.
          </div>
        )}
      </section>

      {/* نافذة إضافة لجنة */}
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
                  value={committeeForm.committee_name}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, committee_name: e.target.value })}
                  placeholder="مثال: لجنة التنظيم واللوجستيات"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وصف اللجنة</label>
                <textarea
                  rows={3}
                  value={committeeForm.description || ''}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, description: e.target.value })}
                  placeholder="مهام واختصاصات هذه اللجنة..."
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCommitteeModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  حفظ اللجنة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة مهمة */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {taskForm.committee_id ? 'إضافة مهمة جديدة للجنة' : 'إضافة مهمة جديدة للنشاط'}
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="مثال: تجهيز الهدايا والتوزيع"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وصف المهمة</label>
                <textarea
                  rows={2}
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="تفاصيل المتطلبات أو رابط المجلدات..."
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ ووقت التسليم *</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.due_time}
                    onChange={(e) => setTaskForm({ ...taskForm, due_time: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">عدد المتطوعين *</label>
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
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  إنشاء المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
