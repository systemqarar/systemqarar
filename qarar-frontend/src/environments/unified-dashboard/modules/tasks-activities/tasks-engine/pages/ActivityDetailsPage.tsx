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

  // Modals States
  const [showAddCommitteeModal, setShowAddCommitteeModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // Assign Volunteer Modal State
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState<Task | null>(null);

  const [activeCommitteeId, setActiveCommitteeId] = useState<string | undefined>(undefined);

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
      {/* هيدر الصفحة والتشخيص */}
      <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono flex flex-wrap justify-between items-center gap-2">
        <div>🆔 المعرف: <span className="text-white">{activityId || 'غير محدد'}</span></div>
        <div>⏳ التحميل: <span className="text-white">{loading ? 'جاري...' : 'مكتمل'}</span></div>
        <div>📦 البيانات: <span className="text-white">{currentActivity ? 'متوفرة ✅' : 'غير متوفرة ❌'}</span></div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/tasks-activities')}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <span>→</span> العودة القائمة
        </button>
      </div>

      {/* تفاصيل النشاط */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 bg-emerald-50 rounded-xl">{currentActivity?.icon || '🎯'}</span>
              <h1 className="text-2xl font-bold text-gray-900">{currentActivity?.title || 'نشاط بدون عنوان'}</h1>
            </div>
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

      {/* عرض اللجان ومهامها */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">🏛️ اللجان الفرعية</h2>
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
                    className="px-3 py-1.5 bg-white border text-xs rounded-xl font-bold"
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
                        className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold"
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
      </section>

      {/* عرض المهام العامة */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">📌 المهام العامة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standaloneTasks.map((task: Task) => (
            <div key={task.id} className="space-y-2">
              <TaskCard task={task} onApply={applyForTask} onExcuse={submitExcuse} />
              <button
                type="button"
                onClick={() => setSelectedTaskForAssign(task)}
                className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold"
              >
                👤 + إضافة متطوع للمهمة
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🎯 استدعاء المكون المستقل من مجلد components */}
      <AssignVolunteerModal
        task={selectedTaskForAssign}
        isOpen={!!selectedTaskForAssign}
        onClose={() => setSelectedTaskForAssign(null)}
      />
    </div>
  );
};
