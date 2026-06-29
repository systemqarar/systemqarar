import React from 'react';

export interface VolunteerCardData {
  id: number;
  volunteerId: string;
  fullName: string;
  phone: string;
  unitId: number;
  unitName?: string | null;
  photoUrl?: string | null;
  status: string;
  approvedAt?: string | null;
  createdAt: string;
}

// 🔤 دالة استخراج الحروف الأولى من الاسم ديناميكياً
const getInitials = (fullName: string) => {
  if (!fullName) return "م";
  const nameParts = fullName.trim().split(/\s+/);
  const firstLetter = nameParts[0] ? nameParts[0][0] : "";
  const fatherLetter = nameParts[1] ? nameParts[1][0] : "";
  return `${firstLetter} ${fatherLetter}`.trim();
};

export const VolunteerCard = ({ volunteer }: { volunteer: VolunteerCardData }) => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrValue = `${currentOrigin}/profile/${volunteer.volunteerId}`; 
  const qrColor = "991b1b"; 

  const formatCardDate = (dateString?: string | null) => {
    if (!dateString) return "قيد الانتظار";
    try {
      return new Date(dateString).toLocaleDateString("ar-EG");
    } catch (e) {
      return "قيد المعالجة";
    }
  };

  return (
    <div 
      id="id-card-render"
      className="relative w-[310px] min-h-[540px] rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden border-[3px] border-red-600 shrink-0 flex flex-col items-center p-6 text-center mx-auto bg-white select-none my-4 animate-fadeIn"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* 🕸️ الخلفية الزخرفية للهلال الأحمر */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="mesh-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 10 10 L 40 25 L 70 10 L 40 55 Z" fill="none" stroke="#ef4444" strokeWidth="0.5"/>
            <path d="M 10 70 L 40 55 L 70 70 Z" fill="none" stroke="#ef4444" strokeWidth="0.5"/>
            <circle cx="10" cy="10" r="1.5" fill="#ef4444"/>
            <circle cx="40" cy="25" r="1.5" fill="#ef4444"/>
            <circle cx="70" cy="10" r="1.5" fill="#ef4444"/>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#mesh-pattern)"/>
        </svg>
      </div>
      
      {/* الشريط العلوي */}
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-800 via-red-600 to-red-800 shadow-md"></div>

      {/* 🌙 الترويسة والشعار الرسمي */}
      <div className="relative z-10 w-full mb-4 mt-2 flex flex-col items-center">
        <div className="w-14 h-14 mb-2 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#c10d28] drop-shadow-md" fill="currentColor">
            <defs>
              <mask id="perfect-moon-mask">
                <circle cx="50" cy="50" r="40" fill="white" />
                <circle cx="65" cy="50" r="35" fill="black" />
              </mask>
            </defs>
            <circle cx="50" cy="50" r="40" mask="url(#perfect-moon-mask)" />
          </svg>
        </div>
        <div className="text-[13px] text-gray-900 font-black leading-tight tracking-tight">جمعية الهلال الأحمر السوداني</div>
        <div className="text-[11px] text-red-700 font-bold">فرع ولاية الخرطوم</div>
        <div className="text-[10px] text-black font-black mt-0.5">مكتب طوارئ محلية جبل أولياء</div>
      </div>

      {/* 👤 الصورة الشخصية الدائرية */}
      <div className="relative z-10 mb-6 mt-2">
        <div className="absolute inset-0 bg-red-500/5 blur-[25px] rounded-full scale-110"></div>
        <div className="relative w-28 h-28 rounded-full border-[5px] border-white shadow-xl p-0.5 bg-gradient-to-tr from-red-600 via-red-500 to-red-400 overflow-hidden mx-auto">
          <div className="w-full h-full rounded-full border border-white/20 overflow-hidden bg-white">
            {volunteer.photoUrl ? (
              <img src={volunteer.photoUrl} className="w-full h-full object-cover rounded-full" alt="Volunteer" />
            ) : (
              <div className="w-full h-full bg-[#991b1b] text-white flex items-center justify-center font-black text-xl tracking-wider rounded-full">
                {getInitials(volunteer.fullName)}
              </div>
            )}
          </div>
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] px-5 py-1 rounded-full font-black border-2 border-white whitespace-nowrap shadow-md">
          بطاقة متطوع رقمية
        </div>
      </div>

      {/* 📊 صندوق البيانات الأساسية */}
      <div className="relative z-10 w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-red-50 shadow-lg p-5 mb-3 overflow-hidden border-b-[4px] border-b-red-50/50">
        <div className="relative z-20 mb-5 text-right">
          <div className="text-[9px] text-gray-400 font-bold mb-0.5">الاسم الكامل للمتطوع</div>
          <div className="text-[16px] font-black text-gray-800 leading-tight">{volunteer.fullName}</div>
        </div>

        <div className="relative z-20 flex flex-row-reverse items-start justify-between border-t border-gray-100 pt-4">
          {/* 🔍 رمز الـ QR الذكي */}
          <div className="bg-white p-1 rounded-xl border border-red-100 shadow-sm shrink-0 ml-2">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(qrValue)}&color=${qrColor}`}
              alt="QR Verification"
              className="w-[60px] h-[60px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-y-3 text-right flex-1">
            <div>
              <div className="text-[8px] text-gray-400 font-bold mb-0.5">رقم المتطوع</div>
              <div className="text-[11px] font-black text-red-600 font-mono tracking-tight">{volunteer.volunteerId}</div>
            </div>
            <div>
              <div className="text-[8px] text-gray-400 font-bold mb-0.5">الوحدة الإدارية</div>
              <div className="text-[10px] font-black text-gray-700 truncate">
                {volunteer.unitName || "مكتب الطوارئ المركزي"}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-2 gap-x-2 mt-3 pt-3 border-t border-gray-50 text-right">
          <div>
            <div className="text-[8px] text-gray-400 font-bold mb-0.5">رقم الهاتف</div>
            <div className="text-[9px] font-black text-gray-700">{volunteer.phone}</div>
          </div>
          <div>
            <div className="text-[8px] text-gray-400 font-bold mb-0.5">تاريخ الاعتماد</div>
            <div className="text-[9px] font-black text-gray-700">
              {formatCardDate(volunteer.approvedAt || volunteer.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* التذييل الرسمي */}
      <div className="relative z-10 w-full mt-auto">
        <div className="bg-red-600 text-white py-2.5 px-4 rounded-xl mb-2 shadow-sm text-center">
          <p className="text-[9px] font-black tracking-wide">معتمدة من مكتب طوارئ محلية جبل أولياء 2026</p>
        </div>
        <div className="text-[7px] text-gray-400 font-mono tracking-[0.3em] uppercase font-bold opacity-60 text-center">SRCS DIGITAL ID SYSTEM</div>
      </div>
    </div>
  );
};
