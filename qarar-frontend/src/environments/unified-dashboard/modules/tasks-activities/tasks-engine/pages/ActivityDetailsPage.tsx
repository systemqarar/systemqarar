import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { Activity, Task } from '../types/tasks-engine.types';

export const TasksActivitiesPage: React.FC = () => {
  const navigate = useNavigate();

  // استدعاء محرك المهام مع الحماية
  const engine = useTasksEngine() || {};
  const {
    tasks = [],
    activities = [],
    loading = false,
    error = null,
    fetchTasks,
    fetchActivities,
    applyForTask = () => {},
    submitExcuse = () => {},
    currentUserId,
  } = engine;

  // التبويب النشط: my_tasks (مهامي) | market (سوق الفرص) | activities (الأنشطة)
  const [activeTab, setActiveTab] = useState<'my_tasks' | 'market' | 'activities'>('my_tasks');

  // جلب البيانات عند التحميل الأول
  useEffect(() => {
    if (fetchTasks) fetchTasks();
    if (fetchActivities) fetchActivities();
  }, [fetchTasks, fetchActivities]);

  // تصنيف المهام
  const safeTasks: Task[] = Array.isArray(tasks) ? tasks : [];
  const safeActivities: Activity[] = Array.isArray(activities) ? activities : [];

  // 1. مهامي المسندة
  const myTasks = safeTasks.filter((task) =>
    task.assignments?.some((a) => a.volunteer_id === currentUserId)
  );

  // 2. سوق الفرص (المهام المفتوحة للانضمام)
  const openMarketTasks = safeTasks.filter(
    (task) =>
      task.assignment_type === 'open_announcement' &&
      !task.assignments?.some((a) => a.volunteer_id === currentUserId)
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 dir-rtl" dir="rtl">
      {/* شريط العناوين الرئيسي */}
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

        {/* أزرار التبويبات */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'my_tasks'
                ? 'bg-[#7A1C2E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎯 مهامي ({myTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'market'
                ? 'bg-[#7A1C2E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏪 سوق الفرص ({openMarketTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'activities'
                ? 'bg-[#7A1C2E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎪 الأنشطة ({safeActivities.length})
          </button>
        </div>
      </div>

      {/* تنبيه الخطأ أو جاري التحميل */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold">
          🚨 تعذر جلب البيانات: {String(error)}
        </div>
      )}

      {/* محتوى التبويبات */}
      {loading ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl text-gray-400 text-sm font-bold animate-pulse">
          ⏳ جاري جلب المهام والأنشطة...
        </div>
      ) : (
        <>
          {/* 1. تبويب مهامي */}
          {activeTab === 'my_tasks' && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C2E]"></span>
                المهام المسندة إليك حالياً
              </h2>

              {myTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUserId={currentUserId}
                      onApply={applyForTask}
                      onExcuse={submitExcuse}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 text-sm">
                  لا توجد مهام مسندة إليك في الوقت الحالي. يمكنك استكشاف سوق الفرص المتاحة للتطوع!
                </div>
              )}
            </section>
          )}

          {/* 2. تبويب سوق الفرص */}
          {activeTab === 'market' && (
            <section className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C2E]"></span>
                الفرص التطوعية المتاحة للتقديم المباشر
              </h2>

              {openMarketTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {openMarketTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUserId={currentUserId}
                      onApply={applyForTask}
                      onExcuse={submitExcuse}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 text-sm">
                  لا توجد فرص تطوعية عامة معلنة حالياً.
                </div>
              )}
            </section>
          )}

          {/* 3. تبويب الأنشطة البرامجية */}
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
                      onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                      className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-[#7A1C2E]/40 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl p-2 bg-red-50 text-[#7A1C2E] rounded-2xl">
                            {activity.icon || '🎯'}
                          </span>
                          <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-red-50 text-[#7A1C2E] border border-red-100">
                            {activity.status === 'active' ? 'نشط' : activity.status || 'مخطط'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 mb-2">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4">
                            {activity.description}
                          </p>
                        )}
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
                  لم يتم إضافة أي أنشطة أو برامج بعد.
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};
