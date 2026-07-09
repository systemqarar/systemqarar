import React, { useState } from 'react';
// استدعاء الـ Hook المطور اللي بيوفر البيانات مدمجة ومفروزة جاهزة
import { useExecutiveBoard } from '../hooks/useExecutiveBoard';
import { AdminPosition } from '../types/types';

// 🏛️ استدعاء المكونات الهندسية الجديدة من المجلد المخصص لها في الهيكل
import { SearchVolunteerModal } from '../components/SearchVolunteerModal';
import { ConfirmAssignmentModal } from '../components/ConfirmAssignmentModal';

export const ExecutiveBoardPage: React.FC = () => {
  const { 
    unitDesks, 
    localityDesks, 
    availableVolunteers, 
    loading, 
    error, 
    assignMember, 
    exemptMember 
  } = useExecutiveBoard();
  
  // حالة منع النقرات المزدوجة أثناء التخاطب مع السيرفر
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // الحالات البرمجية لإدارة النوافذ المنبثقة المنفصلة
  const [activeDeskForAssign, setActiveDeskForAssign] = useState<{ key: AdminPosition; label: string } | null>(null);
  const [selectedVolunteerForConfirm, setSelectedVolunteerForConfirm] = useState<any | null>(null);

  // 1. شاشة الانتظار أثناء جلب البيانات من Neon DB
  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-[#0B132B] min-h-screen text-gray-400 font-medium animate-pulse">
        جاري تحميل الهيكل التنفيذي للقرار...
      </div>
    );
  }

  // 2. شاشة عرض الخطأ في حال حدوث مشكلة في الاتصال بالباكيند
  if (error) {
    return (
      <div className="flex justify-center items-center py-32 bg-[#0B132B] min-h-screen text-red-400 font-medium border border-red-900/20 m-6 rounded-2xl">
        ⚠️ {error}
      </div>
    );
  }

  // دالة معالجة التعيين النهائي عند ضغط زر التأكيد في الـ Modal المعماري
  const handleConfirmAssignment = async () => {
    if (!selectedVolunteerForConfirm || !activeDeskForAssign) return;
    const deskKey = activeDeskForAssign.key;
    setActionLoading(deskKey);
    
    const res = await assignMember(selectedVolunteerForConfirm.volunteer_number, deskKey);
    
    setActionLoading(null);
    setSelectedVolunteerForConfirm(null); // تصفير الاختيار
    setActiveDeskForAssign(null);          // إغلاق النوافذ
    
    if (res && !res.success) {
      alert(res.message);
    }
  };

  // دالة فرعية موحدة لرسم كرت المنصب
  const renderDeskCard = (desk: { key: AdminPosition; label: string; member: any }) => {
    const occupant = desk.member;
    const isDeputy = desk.key.includes('deputy');

    return (
      <div 
        key={desk.key} 
        className="bg-[#1C2541] border border-gray-700/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-gray-500 hover:shadow-2xl"
      >
        {/* رأس الكرت: اسم المنصب ونوعه */}
        <div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            isDeputy 
              ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' 
              : 'bg-blue-950/40 text-blue-400 border border-blue-900/40'
          }`}>
            {isDeputy ? '⚖️ منصب مساعد / نائب' : '⭐ منصب قيادي رئيسي'}
          </span>
          <h3 className="text-base font-bold mt-2.5 text-gray-100">{desk.label}</h3>
        </div>

        {/* أسفل الكرت: التحكم بالمنصب (مشغول أو شاغر) */}
        <div className="mt-5 pt-4 border-t border-gray-700/40">
          {occupant ? (
            /* [حالة أ] المنصب مشغول -> عرض بيانات العضو الحالي وزر الإعفاء */
            <div className="flex items-center justify-between bg-[#0B132B]/40 p-3 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 flex items-center justify-center shrink-0">
                  {occupant.photo_url ? (
                    <img src={occupant.photo_url} alt={occupant.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400 font-bold">Q</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{occupant.full_name}</p>
                  <p className="text-[11px] text-gray-400 mt-1">رقم المتطوع: {occupant.volunteer_number}</p>
                </div>
              </div>
              
              <button
                disabled={actionLoading !== null}
                onClick={async () => {
                  if (!window.confirm(`هل أنت متأكد من إعفاء [${occupant.full_name}] من منصب [${desk.label}]؟`)) return;
                  setActionLoading(desk.key);
                  await exemptMember(occupant.volunteer_number);
                  setActionLoading(null);
                }}
                className="text-xs bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 border border-red-900/30 font-medium shrink-0"
              >
                {actionLoading === desk.key ? 'جاري الإعفاء...' : 'إعفاء من المنصب'}
              </button>
            </div>
          ) : (
            /* [حالة ب] المنصب شاغر -> يفتح الـ Modal المخصص بدقة */
            <button
              disabled={actionLoading !== null}
              onClick={() => setActiveDeskForAssign(desk)}
              className="w-full bg-[#0B132B] hover:bg-[#152042] text-xs text-gray-300 border border-gray-600/50 rounded-xl p-3 text-right focus:outline-none focus:border-blue-500 cursor-pointer transition-all flex justify-between items-center group shadow-inner"
            >
              <span className="flex items-center gap-2">
                <span className="text-amber-500 group-hover:animate-pulse">⚠️</span> 
                منصب شاغر - اضغط هنا لتعيين متطوع
              </span>
              <span className="text-gray-500 text-[10px] transition-transform group-hover:translate-x-[-3px]">◀</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#0B132B] min-h-screen text-white mb-10" dir="rtl">
      {/* هيدر الصفحة */}
      <div className="mb-10 border-b border-gray-800/80 pb-5">
        <h1 className="text-2xl font-bold text-gray-100 tracking-wide">إدارة الهيكل التنفيذي والمناصب</h1>
        <p className="text-gray-400 text-xs mt-2">لوحة السوبر أدمن لإدارة وتسكين المكاتب التنفيذية بالوحدة ومكاتب الإشراف بالمحلية.</p>
      </div>

      {/* 👥 الكتلة الأولى: المكاتب التنفيذية للوحدة */}
      <div className="mb-12">
        <div className="flex items-center gap-2.5 mb-5 bg-[#1C2541]/30 p-3 rounded-xl border border-gray-800/60 w-fit">
          <span className="text-lg">👥</span>
          <h2 className="text-base font-bold text-blue-400">المكتب التنفيذي للوحدة (14 منصب)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {unitDesks.map(renderDeskCard)}
        </div>
      </div>

      {/* 🏛️ الكتلة الثانية: مكاتب وإشراف المحلية */}
      <div>
        <div className="flex items-center gap-2.5 mb-5 bg-[#1C2541]/30 p-3 rounded-xl border border-gray-800/60 w-fit">
          <span className="text-lg">🏛️</span>
          <h2 className="text-base font-bold text-amber-400">المكاتب الإشرافية والتدريبية التابعة للمحلية (منصبين)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {localityDesks.map(renderDeskCard)}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🖥️ حركية استدعاء النوافذ المنفصلة وتمرير البيانات عبر الـ Props */}
      {/* ============================================================ */}
      
      {/* 1. نافذة البحث الذكي في المتطوعين */}
      <SearchVolunteerModal
        isOpen={activeDeskForAssign !== null}
        onClose={() => {
          setActiveDeskForAssign(null);
          setSelectedVolunteerForConfirm(null);
        }}
        deskLabel={activeDeskForAssign?.label || ''}
        availableVolunteers={availableVolunteers}
        onSelectVolunteer={(vol) => setSelectedVolunteerForConfirm(vol)}
      />

      {/* 2. نافذة التثبت وبث القرار النهائي بقاعدة البيانات */}
      <ConfirmAssignmentModal
        isOpen={selectedVolunteerForConfirm !== null && activeDeskForAssign !== null}
        onClose={() => setSelectedVolunteerForConfirm(null)}
        onConfirm={handleConfirmAssignment}
        volunteerName={selectedVolunteerForConfirm?.full_name || ''}
        deskLabel={activeDeskForAssign?.label || ''}
        isLoading={actionLoading === activeDeskForAssign?.key}
      />

    </div>
  );
};
