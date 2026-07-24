import React, { useState } from 'react';
import { useTasksEngine } from '../hooks/useTasksEngine';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskInput, TaskPriority } from '../types/tasks-engine.types';
import { Plus, X, Calendar, Flag, Users, FileCheck } from 'lucide-react';

export const TasksEnginePage: React.FC = () => {
  const engine = useTasksEngine();
  const { tasks = [], activities = [], loading = false, applyForTask, submitExcuse, createTask } = engine || {};
  
  const [selectedTab, setSelectedTab] = useState<'all' | 'open' | 'activities'>('all');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('');

  // حالة النافذة المنبثقة للإنشاء
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // الحالة الابتدائية المطابقة لتعريف CreateTaskInput 100%
  const initialFormState: CreateTaskInput = {
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

  const [formData, setFormData] = useState<CreateTaskInput>(initialFormState);

  // حماية المصفوفات
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  // جلب اللجان الخاصة بالنشاط المختار في النموذج
  const selectedActivityObj = safeActivities.find(act => act.id === formData.activity_id);
  const availableCommittees = selectedActivityObj?.committees || [];

  // تصفية المهام المعروضة
  const filteredTasks = safeTasks.filter((t) => {
    if (selectedActivityFilter && t?.activity_id !== selectedActivityFilter) return false;
    if (selectedTab === 'open') return t?.assignment_type === 'open_announcement';
    return true;
  });

  // معالجة الحفظ والتنظيف المؤسس للبيانات قبل الإرسال
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('يرجى كتابة عنوان المهمة');
      return;
    }
    if (!formData.due_time) {
      alert('يرجى تحديد تاريخ ووقت التسليم النهائي');
      return;
    }

    // تنظيف الحقول الاختيارية غير الفارغة
    const payload: CreateTaskInput = {
      ...formData,
      activity_id: formData.activity_id || undefined,
      committee_id: formData.committee_id || undefined,
      description: formData.description || undefined,
    };

    setSubmitting(true);
    const success = await createTask(payload);
    setSubmitting(false);

    if (success) {
      setIsModalOpen(false);
      setFormData(initialFormState);
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

        <select
          value={selectedActivityFilter}
          onChange={(e) => setSelectedActivityFilter(e.target.value)}
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

      {/* عرض المهام */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm font-semibold animate-pulse">جاري جلب البيانات من السيرفر...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm font-bold">لا توجد مهام مطابقة حالياً.</p>
          <p className="text-gray-400 text-xs mt-1">اضغط على زر "إنشاء مهمة جديدة" بالأعلى لإضافة أول مهمة.</p>
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

      {/* النافذة المنبثقة لإنشاء مهمة متطابقة 100% مع النمط المؤسسي */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl relative border border-gray-100 my-8">
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
              {/* عنوان المهمة */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إعداد التقرير الختامي لبرنامج قرار"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              {/* التفاصيل والوصف */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وصف المهمة والمتطلبات</label>
                <textarea
                  rows={3}
                  placeholder="اكتب شرحاً شاملاً للمطلوب مخرجه..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              {/* نوع التكليف والأولوية */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">آلية التكليف</label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value as 'direct' | 'open_announcement' })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="direct">تكليف مباشر</option>
                    <option value="open_announcement">فرصة مفتوحة (سوق الفرص)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مستوى الأولوية</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="low">منخفضة (Low)</option>
                    <option value="normal">عادية (Normal)</option>
                    <option value="high">مرتفعة (High)</option>
                    <option value="urgent">طارئة جداً (Urgent)</option>
                  </select>
                </div>
              </div>

              {/* نوع الإجراء والحد الأقصى للمستفيدين */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع إجراء المهمة</label>
                  <select
                    value={formData.action_type}
                    onChange={(e) => setFormData({ ...formData, action_type: e.target.value as 'standard' | 'form_filling' | 'file_upload' })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  >
                    <option value="standard">مهمة اعتيادية (Standard)</option>
                    <option value="form_filling">تعبئة نموذج (Form Filling)</option>
                    <option value="file_upload">رفع ملفات ومستندات (File Upload)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العدد المطلوب للمهمة</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_volunteers || 1}
                    onChange={(e) => setFormData({ ...formData, max_volunteers: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                  />
                </div>
              </div>

              {/* تاريخ التسليم النهائي */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ ووقت التسليم النهائي (Due Time) *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.due_time}
                  onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#7A1C2E]"
                />
              </div>

              {/* ربط بالنشاط واللجنة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الربط بنشاط برامجي</label>
                  <select
                    value={formData.activity_id || ''}
                    onChange={(e) => setFormData({ ...formData, activity_id: e.target.value, committee_id: '' })}
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
                    disabled={!formData.activity_id || availableCommittees.length === 0}
                    value={formData.committee_id || ''}
                    onChange={(e) => setFormData({ ...formData, committee_id: e.target.value })}
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

              {/* أزرار الإجراءات */}
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
