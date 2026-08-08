import React, { useState } from 'react';
import { Task } from '../types/tasks-engine.types';
import { UserPlus, Calendar, Users, CheckCircle2, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  currentUserId?: string;
  committeeName?: string; // تم إضافته لتحديد اسم اللجنة
  onApply?: (taskId: string) => void;
  onExcuse?: (assignmentId: string, reason: string) => void;
  onAssignVolunteer?: (taskId: string) => void; // زر إضافة/تنسيق متطوع كأيقونة علوية
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUserId,
  committeeName,
  onApply,
  onExcuse,
  onAssignVolunteer,
}) => {
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excuseReason, setExcuseReason] = useState('');

  // تحديد أولوية المهمة
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2.5 py-1 text-xs bg-rose-100 text-rose-800 rounded-full font-bold border border-rose-200">عاجل طارئ</span>;
      case 'high':
        return <span className="px-2.5 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-bold border border-amber-200">عالي الأهمية</span>;
      case 'normal':
        return <span className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-800 rounded-full font-bold border border-emerald-200">عادي</span>;
      default:
        return <span className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-full font-medium border border-slate-200">منخفض</span>;
    }
  };

  const activeAssignments = task.assignments?.filter(a => a.status !== 'excused') || [];
  const assignedCount = activeAssignments.length;
  const maxVolunteers = task.max_volunteers || 1;
  const isFull = assignedCount >= maxVolunteers;

  const myAssignment = task.assignments?.find(a => a.volunteer_id === currentUserId && a.status !== 'excused');
  const isAssignedToMe = Boolean(myAssignment);

  const handleExcuseSubmit = () => {
    if (!excuseReason.trim()) return alert('الرجاء كتابة سبب الاعتذار');
    if (myAssignment && onExcuse) {
      onExcuse(myAssignment.id, excuseReason);
      setShowExcuseModal(false);
      setExcuseReason('');
    }
  };

  // تنسيق تاريخ التسليم
  const formattedDueDate = task.due_time
    ? new Date(task.due_time).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'غير محدد';

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between mb-4 relative overflow-hidden" dir="rtl">
      
      <div>
        {/* 1. الشريط العلوي: شارة اللجنة + أولوية المهمة + أيقونة إضافة متطوع */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            {committeeName ? (
              <span className="text-xs font-bold bg-[#7A1C2E]/10 text-[#7A1C2E] px-3 py-1 rounded-full border border-[#7A1C2E]/20">
                مهام لجنة: {committeeName}
              </span>
            ) : (
              <span className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                مهمة لجنة
              </span>
            )}
            {getPriorityBadge(task.priority)}
          </div>

          {/* أيقونة تعيين/إضافة متطوع في الأعلى */}
          {onAssignVolunteer && (
            <button
              onClick={() => onAssignVolunteer(task.id)}
              title="إضافة أو تنسيق المتطوعين"
              className="p-2.5 text-[#7A1C2E] hover:bg-red-50 rounded-2xl transition-all border border-red-100 flex items-center gap-1.5 text-xs font-bold shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة متطوع</span>
            </button>
          )}
        </div>

        {/* 2. عنوان المهمة والوصف */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">{task.title}</h3>
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
            {task.description || 'لا يوجد وصف تفصيلي إضافي لهذه المهمة.'}
          </p>
        </div>

        {/* 3. صندوق الاحتياج الصريح لعدد المتطوعين */}
        <div className="bg-slate-50 rounded-2xl p-3.5 mb-4 border border-slate-100">
          <div className="flex items-center justify-between text-xs text-gray-800 mb-2 font-bold">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#7A1C2E]" />
              تتطلب هذه المهمة <strong className="text-[#7A1C2E] font-black text-sm">{maxVolunteers}</strong> متطوعين
            </span>
            <span className="text-gray-500 font-semibold">{assignedCount} / {maxVolunteers}</span>
          </div>

          {/* شريط مكتملية العدد */}
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isFull ? 'bg-emerald-600' : 'bg-[#7A1C2E]'}`}
              style={{ width: `${Math.min((assignedCount / maxVolunteers) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. المتطوعون المنضمون + تاريخ التسليم */}
      <div>
        <div className="flex items-center justify-between pt-2 mb-4 border-t border-gray-100">
          {/* صور/رموز المتطوعين المسندين */}
          <div className="flex items-center">
            <div className="flex -space-x-2 space-x-reverse overflow-hidden">
              {activeAssignments.slice(0, 5).map((assign: any, idx: number) => (
                <div key={assign.id || assign.volunteer_id || idx} className="relative inline-block">
                  {assign.avatar_url ? (
                    <img
                      src={assign.avatar_url}
                      alt={assign.volunteer_name || 'متطوع'}
                      className="h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                      title={assign.volunteer_name || 'متطوع'}
                    />
                  ) : (
                    <div 
                      className="h-8 w-8 rounded-full ring-2 ring-white bg-[#7A1C2E] text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
                      title={assign.volunteer_name || 'متطوع'}
                    >
                      {assign.volunteer_name ? assign.volunteer_name.charAt(0) : <User className="w-4 h-4" />}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {activeAssignments.length > 5 && (
              <span className="mr-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                +{activeAssignments.length - 5}
              </span>
            )}

            {assignedCount === 0 && (
              <span className="text-xs text-gray-400 font-medium italic">لم يتم تعيين متطوعين بعد</span>
            )}
          </div>

          {/* موعد التسليم */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>التسليم: <strong className="text-gray-700">{formattedDueDate}</strong></span>
          </div>
        </div>

        {/* منشئ المهمة */}
        {task.creator_name && (
          <div className="text-[11px] text-gray-400 mb-3">
            👤 بواسطة: <span className="font-semibold text-gray-600">{task.creator_name}</span>
          </div>
        )}

        {/* 5. حالة الإسناد والتقديم */}
        <div className="border-t border-gray-100 pt-3">
          {task.assignment_type === 'open_announcement' && !isAssignedToMe && onApply && (
            <button
              onClick={() => onApply(task.id)}
              disabled={isFull}
              className={`w-full py-2.5 px-4 text-xs font-bold rounded-2xl transition-all duration-200 shadow-sm ${
                isFull
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  : 'bg-[#7A1C2E] hover:bg-[#621524] text-white'
              }`}
            >
              {isFull ? 'اكتمل عدد المتطوعين' : 'التقديم على المهمة'}
            </button>
          )}

          {isAssignedToMe && (
            <div className="flex items-center justify-between w-full bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> مسندة إليك
              </span>
              {onExcuse && (
                <button
                  onClick={() => setShowExcuseModal(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-bold transition-colors"
                >
                  تقديم اعتذار
                </button>
              )}
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
