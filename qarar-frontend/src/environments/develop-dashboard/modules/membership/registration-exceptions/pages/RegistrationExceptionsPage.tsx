import React, { useState } from 'react';
import { useRegistrationExceptions } from '../hooks/useRegistrationExceptions';
import { AddExceptionModal } from '../components/AddExceptionModal';

export const RegistrationExceptionsPage: React.FC = () => {
  // استدعاء الـ هوك المطور التكتيكي حقنا
  const { exceptions, loading, error, actionLoading, addException, deleteException } = useRegistrationExceptions();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-[#0B132B] min-h-screen text-gray-400 font-medium animate-pulse">
        جاري تحميل قائمة الاستثناءات التكتيكية...
      </div>
    );
  }

  const handleAddExceptionConfirm = async (formData: any) => {
    const result = await addException(formData);
    if (result.success) {
      setIsModalOpen(false);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="p-6 bg-[#0B132B] min-h-screen text-white mb-10" dir="rtl">
      
      {/* هيدر الصفحة */}
      <div className="mb-10 border-b border-gray-800/80 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-wide">نظام استثناءات التسجيل</h1>
          <p className="text-gray-400 text-xs mt-2">لوحة التحكم التكتيكية لإدارة المتطوعين المستثنيين ومتابعة حالتهم الحركية.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg"
        >
          <span>➕</span> إضافة عضو مستثنى جديد
        </button>
      </div>

      {error && <div className="p-4 bg-red-950/40 text-red-400 border border-red-900/30 rounded-xl mb-6 text-sm">⚠️ {error}</div>}

      {/* عرض الكروت */}
      {exceptions.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 text-sm">
          لا يوجد أعضاء مضافين في قائمة الاستثناءات حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {exceptions.map((member) => (
            <div key={member.id} className="bg-[#1C2541] border border-gray-700/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${member.has_registered ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40' : 'bg-amber-950/50 text-amber-400 border border-amber-900/40'}`}>
                  {member.has_registered ? '✅ قام بالتسجيل بالفعل' : '⏳ لم يسجل في النظام بعد'}
                </span>
                
                <button
                  disabled={actionLoading !== null}
                  onClick={() => deleteException(member.id)}
                  className="text-xs bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition-all font-medium"
                >
                  {actionLoading === member.id ? 'جاري الحذف...' : 'حذف وإلغاء استثناء'}
                </button>
              </div>

              <div className="flex items-center gap-4 bg-[#0B132B]/40 p-3 rounded-xl border border-gray-800 mt-4">
                <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 flex items-center justify-center shrink-0">
                  {member.photo_url ? <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" /> : <span className="text-sm text-gray-400 font-bold">Q</span>}
                </div>
                <div className="text-right">
                  <h3 className="text-base font-bold text-white leading-tight">{member.full_name}</h3>
                  <p className="text-xs text-gray-400 mt-1">رقم المتطوع: <span className="text-gray-300 font-mono">{member.volunteer_number}</span></p>
                  <p className="text-xs text-blue-400 mt-0.5">الوحدة: {member.unit_name}</p>
                </div>
              </div>

              {member.notes && (
                <div className="mt-3 bg-[#0B132B]/20 p-2.5 rounded-lg border border-gray-800/60 text-xs text-gray-400">
                  <span className="text-amber-500 font-medium">📌 ملاحظة الإضافة:</span> {member.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* استدعاء المكون المنبثق المنفصل */}
      <AddExceptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddExceptionConfirm}
        isActionLoading={actionLoading === 'add'}
      />

    </div>
  );
};
