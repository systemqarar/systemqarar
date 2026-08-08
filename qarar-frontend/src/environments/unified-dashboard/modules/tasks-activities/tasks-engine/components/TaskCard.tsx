import React, { useState } from 'react';
import { Task } from '../types/tasks-engine.types';

interface TaskCardProps {
  task: Task;
  currentUserId?: string;
  onApply: (taskId: string) => void;
  onExcuse: (assignmentId: string, reason: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, currentUserId, onApply, onExcuse }) => {
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excuseReason, setExcuseReason] = useState('');

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return <span className="px-2 py-0.5 text-[11px] bg-rose-100 text-rose-800 rounded-full font-bold border border-rose-200">عاجل طارئ</span>;
      case 'high': 
        return <span className="px-2 py-0.5 text-[11px] bg-amber-100 text-amber-800 rounded-full font-bold border border-amber-200">عالي الأهمية</span>;
      case 'normal': 
        return <span className="px-2 py-0.5 text-[11px] bg-red-50 text-[#7A1C2E] rounded-full font-bold border border-red-100">عادي</span>;
      default: 
        return <span className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded-full font-medium border border-slate-200">منخفض</span>;
    }
  };

  const myAssignment = task.assignments?.find(a => a.volunteer_id === currentUserId);
  const isAssignedToMe = Boolean(myAssignment);
  const isFull = (task.assignments?.length || 0) >= (task.max_volunteers || 1);

  const handleExcuseSubmit = () => {
    if (!excuseReason.trim()) return alert('الرجاء كتابة سبب الاعتذار');
    if (myAssignment) {
      // تم الاعتماد على myAssignment.id ليتوافق مع interface TaskAssignment
      onExcuse(myAssignment.id, excuseReason);
      setShowExcuseModal(false);
      setExcuseReason('');
    }
  };

  // تنسيق التاريخ باللغة العربية مع مراعاة الأمان
  const formattedDueDate = task.due_time
    ? new Date(task.due_time).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'غير محدد';

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between" dir="rtl">
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="text-base font-bold text-gray-900 leading-snug">{task.title}</h3>
          {getPriorityBadge(task.priority)}
        </div>

        {task.description && (
          <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 mb-3 border-t border-gray-100 pt-3 gap-2">
          <div>⏱ التسليم: <span className="font-semibold text-gray-700">{formattedDueDate}</span></div>
          <div>👥 المتطوعين: <span className="font-semibold text-gray-700">{task.assignments?.length || 0} / {task.max_volunteers || 1}</span></div>
        </div>

        {task.creator_name && (
          <div className="text-[11px] text-gray-400 mb-3">
            👤 بواسطة: <span className="font-medium text-gray-600">{task.creator_name}</span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-3 mt-1">
          {task.assignment_type === 'open_announcement' && !isAssignedToMe && (
            <button
              onClick={() => onApply(task.id)}
              disabled={isFull}
              className={`w-full py-2 px-4 text-xs font-bold rounded-2xl transition-all duration-200 shadow-sm ${
                isFull 
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                  : 'bg-[#7A1C2E] hover:bg-[#621524] text-white'
              }`}
            >
              {isFull ? 'اكتمل عدد المتطوعين' : 'التقديم على المهمة'}
            </button>
          )}

          {isAssignedToMe && myAssignment?.status !== 'excused' && (
            <div className="flex items-center justify-between w-full bg-red-50/60 p-2.5 rounded-2xl border border-red-100">
              <span className="text-xs text-[#7A1C2E] font-bold flex items-center gap-1">
                <span>✓</span> مسندة إليك
              </span>
              <button
                onClick={() => setShowExcuseModal(true)}
                className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-bold transition-colors"
              >
                تقديم اعتذار
              </button>
            </div>
          )}
        </div>
      </div>

      {/* نافذة الاعتذار */}
      {showExcuseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir="rtl">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h4 className="text-base font-bold text-gray-900 mb-2">طلب اعتذار عن المهمة</h4>
            <p className="text-xs text-gray-500 mb-4">يرجى توضيح سبب الاعتذار لإتاحة الفرصة لمتطوع آخر.</p>
            <textarea
              value={excuseReason}
              onChange={(e) => setExcuseReason(e.target.value)}
              placeholder="اكتب سبب الاعتذار هنا..."
              className="w-full border border-gray-200 rounded-2xl p-3 text-sm mb-4 focus:ring-2 focus:ring-[#7A1C2E] focus:border-transparent outline-none transition-all"
              rows={3}
            />
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => setShowExcuseModal(false)}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleExcuseSubmit}
                className="px-4 py-2 text-xs bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-sm"
              >
                تأكيد الاعتذار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
