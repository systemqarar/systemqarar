import React, { useState } from 'react';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';

export const TasksEnginePage: React.FC = () => {
  const { tasks, activities, loading, applyForTask, submitExcuse } = useTasksEngine();
  const [selectedTab, setSelectedTab] = useState<'all' | 'open' | 'activities'>('all');
  const [selectedActivity, setSelectedActivity] = useState<string>('');

  const filteredTasks = tasks.filter((t) => {
    if (selectedActivity && t.activity_id !== selectedActivity) return false;
    if (selectedTab === 'open') return t.assignment_type === 'open_announcement';
    return true;
  });

  return (
    <div className="p-6 dir-rtl text-right max-w-7xl mx-auto">
      {/* الهيدر */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">محرك المهام والأنشطة الإدارية</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة الأنشطة واللجان وتوزيع المهام الحوكمية</p>
        </div>
      </div>

      {/* شريط التصفية والتبويب */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              selectedTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            جميع المهام ({tasks.length})
          </button>
          <button
            onClick={() => setSelectedTab('open')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              selectedTab === 'open' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            سوق الفرص المفتوحة
          </button>
        </div>

        {/* فلترة بالنشاط */}
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="border border-gray-300 rounded-lg text-xs p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">جميع الأنشطة البرامجية</option>
          {activities.map((act) => (
            <option key={act.id} value={act.id}>
              {act.title}
            </option>
          ))}
        </select>
      </div>

      {/* قائمة المهام */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">جاري تحميل البيانات...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">لا توجد مهام مطابقة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onApply={applyForTask}
              onExcuse={submitExcuse}
            />
          ))}
        </div>
      )}
    </div>
  );
};
