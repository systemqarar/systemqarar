import React, { useState } from 'react';
// استدعاء الـ Hook المطور اللي بيوفر البيانات مدمجة ومفروزة جاهزة
import { useExecutiveBoard } from '../hooks/useExecutiveBoard';
import { AdminPosition } from '../types/types';

export const ExecutiveBoardPage: React.FC = () => {
  // جلب المجموعات المفروزة وجاهزة من الـ Hook مباشرة
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

  // دالة فرعية موحدة لرسم كرت المنصب (تمنع تكرار الكود وتسهل الصيانة)
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
                {/* الصورة الشخصية أو الحرف البديل */}
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
              
              {/* زر الإعفاء من المنصب */}
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
            /* [حالة ب] المنصب شاغر -> عرض قائمة منسدلة لاختيار متطوع وتعيينه */
            <div className="relative">
              <select
                disabled={actionLoading !== null}
                onChange={async (e) => {
                  const val = e.target.value;
                  if (!val) return;
                  setActionLoading(desk.key);
                  const res = await assignMember(val, desk.key);
                  setActionLoading(null);
                  if (res && !res.success) {
                    alert(res.message);
                  }
                }}
                defaultValue=""
                className="bg-[#0B132B] text-xs text-gray-300 border border-gray-600/50 rounded-xl p-3 w-full focus:outline-none focus:border-blue-500 cursor-pointer appearance-none transition-all pr-3 pl-8"
              >
                <option value="" disabled>⚠️ منصب شاغر - اضغط هنا لتعيين متطوع</option>
                {availableVolunteers.map((vol) => (
                  <option key={vol.volunteer_number} value={vol.volunteer_number} className="bg-[#1C2541]">
                    {vol.full_name} ({vol.volunteer_number})
                  </option>
                ))}
              </select>
              {/* سهم تجميلي منسدل */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#0B132B] min-h-screen text-white mb-10" dir="rtl">
      {/* هيدر الصفحة الرئيسي */}
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
    </div>
  );
};
