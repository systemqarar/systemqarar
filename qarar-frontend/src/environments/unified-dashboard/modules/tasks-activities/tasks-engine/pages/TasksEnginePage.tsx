import React, { useState } from 'react';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { Plus, X } from 'lucide-react';

export const TasksEnginePage: React.FC = () => {
  const engine = useTasksEngine();
  const { tasks = [], activities = [], loading = false, applyForTask, submitExcuse, createTask } = engine || {};
  
  const [selectedTab, setSelectedTab] = useState<'all' | 'open' | 'activities'>('all');
  const [selectedActivity, setSelectedActivity] = useState<string>('');

  // حالات نافذة إنشاء مهمة جديدة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_id: '',
    assignment_type: 'direct',
    points: 10,
  });

  // حماية البيانات
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  const filteredTasks = safeTasks.filter((t) => {
    if (selectedActivity && t?.activity_id !== selectedActivity) return false;
    if (selectedTab === 'open') return t?.assignment_type === 'open_announcement';
    return true;
  });

  // دالة إرسال المهمة الجديدة
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('يرجى كتابة عنوان المهمة');
    
    setSubmitting(true);
    const success = await createTask(formData);
    setSubmitting(false);

    if (success) {
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        activity_id: '',
        assignment_type: 'direct',
        points: 10,
      });
    }
  };

  return (
    <div className="p-4 md:p-6 dir-rtl text-right max-w-7xl mx-auto font-sans pb-24">
      {/* الهيدر وزر الإضافة */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">محرك المهام والأنشطة الإدارية</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">إدارة الأنشطة واللجان وتوزيع المهام الحوكمية</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#7A1C2E] hover:bg-[#560E1A] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          إنشاء مهمة جديدة
        </button>
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

        {/* فلترة بالنشاط */}
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="border border-gray-300 rounded-xl text-xs p-2.5 bg-white outline-none focus:ring-2 focus:ring-[#7A1C2E]"
        >
          <option value="">جميع الأنشطة البرامجية</option>
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
          <p className="text-gray-400 text-xs mt-1">اضغط على زر "إنشاء مهمة جديدة" بالفي الأعلى لإضافة أول مهمة.</p>
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

      {/* 🟢 نافذة منبثقة (Modal) لإنشاء مهمة جديدة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-base font-bold text-gray-900">إضافة مهمة إدارية جديدة</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
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
                  placeholder="مثال: إعداد تقرير الفعالية السنوية"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الوصف والتفاصيل</label>
                <textarea
                  rows={3}
                  placeholder="اكتب شرحاً مختصراً للمطلوب من المكلّف..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع التكليف</label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="direct">تكليف مباشر</option>
                    <option value="open_announcement">فرصة مفتوحة (سوق الفرص)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نقاط الإنجاز</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  />
                </div>
              </div>

              {safeActivities.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ربط بنشاط محدد (اختياري)</label>
                  <select
                    value={formData.activity_id}
                    onChange={(e) => setFormData({ ...formData, activity_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="">غير مرتبط بنشاط</option>
                    {safeActivities.map((act) => (
                      <option key={act?.id} value={act?.id}>
                        {act?.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#7A1C2E] hover:bg-[#560E1A] transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ ونشر المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
