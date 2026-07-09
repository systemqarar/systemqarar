import React from 'react';
// 1. ✨ استوردنا الـ useNavigate عشان نتحكم في حركة التنقل بين الشاشات
import { useNavigate } from 'react-router-dom';

interface CardItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'soon';
  path?: string; // ✨ أضفنا حقل اختياري لتحديد مسار كل كرت
}

const MembershipDashboard: React.FC = () => {
  // 2. ✨ تفعيل دالة التوجيه جوة المكون
  const navigate = useNavigate();
  
  const managementCards: CardItem[] = [
    {
      id: 'executive',
      title: 'الهيكل التنفيذي والمناصب (Executive Board)',
      description: 'عرض الهيكل الإداري الحالي، وإمكانية إعفاء الأعضاء أو تعيين متطوعين في المناصب الشاغرة بواسطة رقم المتطوع.',
      status: 'active',
      path: 'executive-board', // ✨ المسار النسبي للشاشة الجديدة اللي ضفناها في ملف الراوتس
    },
    {
      id: 'directory',
      title: 'دليل الأعضاء العام (Members Directory)',
      description: 'البحث عن حسابات الأعضاء لتعديل بيانات البروفايل، الحظر، الحذف، أو استخدام ميزة الدخول الذكي كـ "أي عضو".',
      status: 'soon',
    },
    {
      id: 'requests',
      title: 'صندوق الطلبات الواردة (Requests Queue)',
      description: 'استقبال طلبات التعيين والإعفاء المرفوعة من رؤساء الوحدات في الميدان للمراجعة والتنفيذ بضغطة زر.',
      status: 'soon',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto text-white" dir="rtl">
      {/* الهيدر والعناوين */}
      <div className="mb-8 text-right">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          إدارة العضوية والمناصب (Membership Hub)
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          لوحة التحكم المركزية لتوزيع المهام الإدارية، تعديل الصلاحيات، وإدارة حسابات متطوعي قرار الحالية.
        </p>
      </div>

      {/* شبكة الكروت */}
      <div className="space-y-4">
        {managementCards.map((card) => (
          <div
            key={card.id}
            className="bg-[#111A35] border border-[#1E294B]/50 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
              {/* عنوان الكرت */}
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
              
              {/* شارة الحالة */}
              {card.status === 'active' ? (
                <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  نشط الآن
                </span>
              ) : (
                <span className="flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  قريباً
                </span>
              )}
            </div>

            {/* تفاصيل الكرت */}
            <p className="text-slate-450 text-xs sm:text-sm mb-4 leading-relaxed">
              {card.description}
            </p>

            {/* زر الدخول الذكي */}
            {card.status === 'active' ? (
              <button
                className="text-rose-500 hover:text-rose-400 text-xs font-bold flex items-center gap-1 transition-colors"
                // 3. ✨ هنا تم استبدال الـ alert بالتوجيه الفعلي للمسار الخاص بالكرت
                onClick={() => card.path && navigate(card.path)}
              >
                دخول لوحة التحكم التفصيلية &larr;
              </button>
            ) : (
              <span className="text-slate-600 text-xs cursor-not-allowed font-bold opacity-60">
                قيد التأسيس...
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipDashboard;
