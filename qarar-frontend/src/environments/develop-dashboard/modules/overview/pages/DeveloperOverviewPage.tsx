import React from 'react';
import { useAuth } from '../../../../../context/AuthContext';

const DeveloperOverviewPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* بنر الترحيب */}
      <div className="bg-gradient-to-r from-[#111A35] to-[#1E294B] p-6 rounded-2xl border border-[#1E294B]">
        <h2 className="text-xl font-bold text-white mb-2">أهلاً بك في غرفة التحكم المركزية 🛠️</h2>
        <p className="text-sm text-slate-400 max-w-xl">
          هذه البيئة مخصصة لك بالكامل لمتابعة البنية التحتية للمنظومة، إدارة قواعد البيانات، وتوزيع الصلاحيات الإدارية والمناصب للأعضاء بدون تخمين.
        </p>
      </div>

      {/* كروت الإحصائيات السريعة كـ تجميل مؤقت */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111A35] p-5 rounded-xl border border-[#1E294B] flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold">حالة اتصال السيرفر</span>
          <h3 className="text-xl font-bold text-emerald-400 mt-2">متصل (Online)</h3>
          <p className="text-[11px] text-slate-500 mt-4">استجابة الـ API مستقرة</p>
        </div>

        <div className="bg-[#111A35] p-5 rounded-xl border border-[#1E294B] flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold">قاعدة البيانات</span>
          <h3 className="text-xl font-bold text-blue-400 mt-2">مؤمنة بالكامل</h3>
          <p className="text-[11px] text-slate-500 mt-4">آخر نسخة احتياطية: تلقائية</p>
        </div>

        <div className="bg-[#111A35] p-5 rounded-xl border border-[#1E294B] flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-semibold">رتبة الحساب الحالي</span>
          <h3 className="text-xl font-bold text-[#C3073F] mt-2">Super Admin</h3>
          <p className="text-[11px] text-slate-500 mt-4">كامل الصلاحيات البرمجية والإدارية ومراقبة السيرفر متاحة لحسابك</p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperOverviewPage;
