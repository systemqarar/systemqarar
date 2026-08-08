import React, { useState } from 'react';
import { Task, TaskAssignment } from '../types/tasks-engine.types';
import { UserPlus, Calendar, Users, CheckCircle2, User, X, MessageSquareWarning } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  currentUserId?: string;
  currentVolunteerNumber?: string;
  committeeName?: string;
  isCreatorOrAdmin?: boolean; // هل المستخدم الحالي هو منشئ المهمة/مشرف؟
  onApply?: (taskId: string) => void;
  onExcuse?: (assignmentId: string, reason: string) => void;
  onAssignVolunteer?: (taskId: string) => void;
  onRemoveVolunteer?: (assignmentId: string) => void; // دالة حذف متطوع بواسطة المشرف
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUserId,
  currentVolunteerNumber,
  committeeName,
  isCreatorOrAdmin = false,
  onApply,
  onExcuse,
  onAssignVolunteer,
  onRemoveVolunteer,
}) => {
  const [showExcuseModal, setShowExcuseModal] = useState<boolean>(false);
  const [showManageModal, setShowManageModal] = useState<boolean>(false);
  const [excuseReason, setExcuseReason] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  // المتطوعون النشطون فقط (غير المعتذرين)
  const activeAssignments: TaskAssignment[] = (task.assignments || []).filter(
    (a: TaskAssignment) => a.status !== 'excused'
  );

  // المتطوعون المعتذرون (للمشرف/المنشئ فقط)
  const excusedAssignments: TaskAssignment[] = (task.assignments || []).filter(
    (a: TaskAssignment) => a.status === 'excused'
  );

  const assignedCount = activeAssignments.length;
  const maxVolunteers = task.max_volunteers || 1;
  const isFull = assignedCount >= maxVolunteers;

  const displayedAssignments = isExpanded ? activeAssignments : activeAssignments.slice(0, 5);
  const remainingCount = activeAssignments.length - 5;

  // مطابقة هوية المتطوع الحالي بشكل دقيق مرن
  const myAssignment = (task.assignments || []).find((a: any) => {
    if (a.status === 'excused') return false;
    const volId = String(a.volunteer_id || a.user_id || '');
    const targetUserId = String(currentUserId || '');
    const volNum = String(a.volunteer_number || '');
    const targetVolNum = String(currentVolunteerNumber || '');

    return (
      (targetUserId && volId === targetUserId) ||
      (targetVolNum && volNum === targetVolNum)
    );
  });

  const isAssignedToMe = Boolean(myAssignment);

  const handleExcuseSubmit = () => {
    if (!excuseReason.trim()) return alert('الرجاء كتابة سبب الاعتذار');
    if (myAssignment && onExcuse) {
      const assignmentId = (myAssignment as any).id || (myAssignment as any).assignment_id;
      onExcuse(assignmentId, excuseReason);
      setShowExcuseModal(false);
      setExcuseReason('');
    }
  };

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
        {/* 1. الشريط العلوي */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            {committeeName ? (
              <span className="text-xs font-bold bg-[#7A1C2E]/10 text-[#7A1C2E] px-3 py-1 rounded-full border border-[#7A1C2E]/20">
                مهام لجنة: {committeeName}
              </span>
            ) : (
              <span className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                مهمة
              </span>
            )}
            {getPriorityBadge(task.priority)}
          </div>

          {/* زر إدارة/إضافة المتطوعين لمنشئ المهمة أو المشرف */}
          {(onAssignVolunteer || isCreatorOrAdmin) && (
            <button
              onClick={() => {
                if (onAssignVolunteer) onAssignVolunteer(task.id);
                setShowManageModal(true);
              }}
              title="إدارة وتنسيق المتطوعين"
              className="p-2.5 text-[#7A1C2E] hover:bg-red-50 rounded-2xl transition-all border border-red-100 flex items-center gap-1.5 text-xs font-bold shadow-sm relative"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">إدارة المتطوعين</span>
              {/* شارة تنبيه إذا كان هناك اعتذارات جديدة للمشرف */}
              {isCreatorOrAdmin && excusedAssignments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {excusedAssignments.length}
                </span>
              )}
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

        {/* 3. شريط الاحتياج */}
        <div className="bg-slate-50 rounded-2xl p-3.5 mb-4 border border-slate-100">
          <div className="flex items-center justify-between text-xs text-gray-800 mb-2 font-bold">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#7A1C2E]" />
              تتطلب هذه المهمة <strong className="text-[#7A1C2E] font-black text-sm">{maxVolunteers}</strong> متطوعين
            </span>
            <span className="text-gray-500 font-semibold">{assignedCount} / {maxVolunteers}</span>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isFull ? 'bg-emerald-600' : 'bg-[#7A1C2E]'}`}
              style={{ width: `${Math.min((assignedCount / maxVolunteers) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. قائمة المتطوعين المنضمين */}
      <div>
        <div className="flex items-start justify-between pt-2 mb-4 border-t border-gray-100 gap-2">

          <div className={`flex items-center gap-3 transition-all duration-300 ${
            isExpanded ? 'overflow-x-auto pb-2 max-w-[70%] scrollbar-thin' : 'flex-wrap max-w-[70%]'
          }`}>
            {displayedAssignments.map((assign: any, idx: number) => {
              const fullVolunteerName = 
                assign.full_name || 
                assign.volunteer_profile?.full_name || 
                assign.volunteer_name || 
                'متطوع';

              const firstName = fullVolunteerName.trim().split(' ')[0];

              const avatarUrl = 
                assign.avatar_url || 
                assign.photo_url || 
                assign.volunteer_profile?.photo_url || 
                assign.volunteer_profile?.secure_photo_url;

              const firstLetter = firstName.charAt(0);

              return (
                <div key={assign.id || assign.assignment_id || assign.volunteer_id || idx} className="flex flex-col items-center gap-1 flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullVolunteerName}
                      className="h-9 w-9 rounded-full object-cover shadow-sm ring-2 ring-gray-100"
                      title={fullVolunteerName}
                    />
                  ) : (
                    <div 
                      className="h-9 w-9 rounded-full bg-[#7A1C2E] text-white text-xs font-bold flex items-center justify-center shadow-sm ring-2 ring-gray-100"
                      title={fullVolunteerName}
                    >
                      {firstLetter ? firstLetter : <User className="w-4 h-4" />}
                    </div>
                  )}

                  <span className="text-[10px] font-bold text-gray-700 max-w-[55px] truncate text-center">
                    {firstName}
                  </span>
                </div>
              );
            })}

            {!isExpanded && remainingCount > 0 && (
              <button
                onClick={() => setIsExpanded(true)}
                title="عرض باقي المتطوعين بالتمرير"
                className="flex flex-col items-center justify-center h-9 w-9 rounded-full bg-[#7A1C2E]/10 hover:bg-[#7A1C2E]/20 text-[#7A1C2E] text-xs font-extrabold border border-[#7A1C2E]/20 transition-all shadow-sm flex-shrink-0"
              >
                +{remainingCount}
              </button>
            )}

            {isExpanded && remainingCount > 0 && (
              <button
                onClick={() => setIsExpanded(false)}
                title="طَي القائمة"
                className="text-[10px] text-gray-500 hover:text-[#7A1C2E] font-bold underline px-1 flex-shrink-0 self-center"
              >
                إغلاق
              </button>
            )}

            {assignedCount === 0 && (
              <span className="text-xs text-gray-400 font-medium italic">لم يتم تعيين متطوعين بعد</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium flex-shrink-0 pt-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>التسليم: <strong className="text-gray-700">{formattedDueDate}</strong></span>
          </div>
        </div>

        {task.creator_name && (
          <div className="text-[11px] text-gray-400 mb-3">
            👤 بواسطة: <span className="font-semibold text-gray-600">{task.creator_name}</span>
          </div>
        )}

        {/* 5. حالة التقديم / الاعتذار للمتطوع */}
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

      {/* modal تقديم اعتذار المتطوع */}
      {showExcuseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir="rtl">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h4 className="text-base font-bold text-gray-900 mb-2">طلب اعتذار عن المهمة</h4>
            <p className="text-xs text-gray-500 mb-4">يرجى توضيح سبب الاعتذار (سيصل سبب الاعتذار لمنشئ المهمة فقط للحفاظ على الخصوصية).</p>
            <textarea
              value={excuseReason}
              onChange={(e) => setExcuseReason(e.target.value)}
              placeholder="اكتب سبب الاعتذار هنا..."
              className="w-full border border-gray-200 rounded-2xl p-3 text-sm mb-4 focus:ring-2 focus:ring-[#7A1C2E] outline-none transition-all"
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

      {/* modal إدارة المتطوعين (عرض المعتذرين وحذف المنضمين للمشرف فقط) */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir="rtl">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h4 className="text-base font-bold text-gray-900">إدارة متطوعي المهمة</h4>
              <button onClick={() => setShowManageModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* المتطوعون الحاليون */}
            <div className="mb-6">
              <h5 className="text-xs font-bold text-gray-700 mb-3">المتطوعون المقبولون ({activeAssignments.length}):</h5>
              <div className="space-y-2">
                {activeAssignments.map((assign: any) => {
                  const name = assign.full_name || assign.volunteer_profile?.full_name || 'متطوع';
                  const assignId = assign.id || assign.assignment_id;
                  return (
                    <div key={assignId} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-xs font-bold text-gray-800">{name}</span>
                      {onRemoveVolunteer && (
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت تأكد من إزالة المتطوع (${name}) من المهمة؟`)) {
                              onRemoveVolunteer(assignId);
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> إزالة
                        </button>
                      )}
                    </div>
                  );
                })}
                {activeAssignments.length === 0 && <p className="text-xs text-gray-400 italic">لا يوجد متطوعون حالياً</p>}
              </div>
            </div>

            {/* سجل الاعتذارات الخاص بالمشرف/المنشئ فقط */}
            {excusedAssignments.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h5 className="text-xs font-bold text-rose-700 mb-3 flex items-center gap-1.5">
                  <MessageSquareWarning className="w-4 h-4 text-rose-600" /> المتطوعون المعتذرون ({excusedAssignments.length}):
                </h5>
                <div className="space-y-2">
                  {excusedAssignments.map((assign: any, idx: number) => {
                    const name = assign.full_name || assign.volunteer_profile?.full_name || 'متطوع';
                    const reason = assign.excuse_reason || 'لم يتم ذكر سبب';
                    return (
                      <div key={idx} className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                        <div className="text-xs font-bold text-gray-800 mb-1">{name}</div>
                        <div className="text-[11px] text-rose-900 bg-white/80 p-2 rounded-xl border border-rose-100">
                          <strong>سبب الاعتذار:</strong> {reason}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
