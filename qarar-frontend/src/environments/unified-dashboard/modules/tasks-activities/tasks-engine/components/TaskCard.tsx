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
      case 'urgent': return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-bold">عاجل طارئ</span>;
      case 'high': return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full font-bold">عالي الأهمية</span>;
      case 'normal': return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">عادي</span>;
      default: return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">منخفض</span>;
    }
  };

  const myAssignment = task.assignments?.find(a => a.volunteer_id === currentUserId);
  const isAssignedToMe = Boolean(myAssignment);
  const isFull = (task.assignments?.length || 0) >= task.max_volunteers;

  const handleExcuseSubmit = () => {
    if (!excuseReason.trim()) return alert('الرجاء كتابة سبب الاعتذار');
    if (myAssignment) {
      onExcuse(myAssignment.assignment_id, excuseReason);
      setShowExcuseModal(false);
      setExcuseReason('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
        {getPriorityBadge(task.priority)}
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 border-t pt-3">
        <div>⏱ التسليم: {new Date(task.due_time).toLocaleDateString('ar-SA')}</div>
        <div>👥 المتطوعين: {task.assignments?.length || 0} / {task.max_volunteers}</div>
        {task.creator_name && <div>👤 بواسطة: {task.creator_name}</div>}
      </div>

      <div className="flex items-center justify-between border-t pt-3 mt-2">
        {task.assignment_type === 'open_announcement' && !isAssignedToMe && (
          <button
            onClick={() => onApply(task.id)}
            disabled={isFull}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              isFull 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isFull ? 'اكتمل المكتفون' : 'التقديم على المهمة'}
          </button>
        )}

        {isAssignedToMe && myAssignment?.status !== 'excused' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-emerald-600 font-semibold">✓ مسندة إليك</span>
            <button
              onClick={() => setShowExcuseModal(true)}
              className="text-xs text-rose-600 hover:underline font-medium"
            >
              تقديم اعتذار
            </button>
          </div>
        )}
      </div>

      {/* نافذة الاعتذار */}
      {showExcuseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h4 className="text-base font-bold text-gray-900 mb-2">طلب اعتذار عن المهمة</h4>
            <p className="text-xs text-gray-500 mb-4">يرجى توضيح سبب الاعتذار لإتاحة الفرصة لمتطوع آخر.</p>
            <textarea
              value={excuseReason}
              onChange={(e) => setExcuseReason(e.target.value)}
              placeholder="اكتب سبب الاعتذار هنا..."
              className="w-full border rounded-lg p-3 text-sm mb-4 focus:ring-2 focus:ring-rose-500 outline-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowExcuseModal(false)}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                onClick={handleExcuseSubmit}
                className="px-4 py-2 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                تاكيد الاعتذار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
