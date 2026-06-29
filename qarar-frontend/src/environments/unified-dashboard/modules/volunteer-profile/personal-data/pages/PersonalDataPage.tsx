import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Loader2, ShieldCheck, Award, Phone, MapPin, 
  Activity, Calendar, Mail, Briefcase, GraduationCap, EyeOff, Heart, CheckCircle 
} from 'lucide-react';
import { usePersonalData } from '../hooks/usePersonalData';

interface PersonalDataPageProps {
  volunteerNumber: string; 
  onBack?: () => void;
}

export const PersonalDataPage: React.FC<PersonalDataPageProps> = ({ volunteerNumber, onBack }) => {
  // استدعاء الكائن الشامل الموحد الجديد من الـ Hook بعد التعديل
  const { loading, profileData } = usePersonalData(volunteerNumber);

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A1C2E]" />
        <span className="text-xs font-bold">جاري قراءة ملفك الموحد من منظومة قرار...</span>
      </div>
    );
  }

  // 🔄 دوال مساعدة لترجمة الحقول النصية بشكل منسق في الواجهة
  const translateGender = (g?: string) => g === 'male' ? 'ذكر' : g === 'female' ? 'أنثى' : 'غير محدد';
  const translateMaritalStatus = (m?: string) => {
    if (m === 'single') return 'عازب/ة';
    if (m === 'married') return 'متزوج/ة';
    if (m === 'other') return 'غير ذلك';
    return '---';
  };
  const translateOffice = (o?: string) => {
    const offices: Record<string, string> = {
      emergency: 'الطوارئ والإسعافات',
      health: 'الصحة والرعاية الطبية',
      media: 'الإعلام والتوثيق',
      training: 'التدريب وبناء القدرات'
    };
    return o ? offices[o] || o : '---';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full text-right pb-10 max-w-3xl mx-auto px-2"
      dir="rtl"
    >
      {/* الرأس (Header) */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">الملف الشخصي الموحد</h1>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">عرض السجل التاريخي والميداني المعتمد في قرار</p>
        </div>
        
        {onBack && (
          <button 
            onClick={onBack}
            className="text-xs font-bold text-[#7A1C2E] bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 active:scale-95 transition-transform"
          >
            رجوع للرئيسية ⬅️
          </button>
        )}
      </div>

      {/* الجزء العلوي: الصورة والاسم والمنصب */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm flex flex-col items-center sm:flex-row sm:text-right gap-4">
        <div className="relative w-24 h-24 rounded-2xl bg-slate-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
          {profileData.profileImageUrl ? (
            <img 
              src={profileData.profileImageUrl} 
              alt="Avatar" 
              className={`w-full h-full object-cover transition-all duration-300 ${profileData.gender === 'female' && profileData.isNiqabi ? 'blur-md scale-105' : ''}`} 
            />
          ) : (
            <User className="w-9 h-9 text-gray-300 stroke-[1.2]" />
          )}

          {profileData.gender === 'female' && profileData.isNiqabi && profileData.profileImageUrl && (
            <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center text-white p-1 backdrop-blur-sm">
              <EyeOff className="w-4 h-4 mb-0.5 text-white" />
              <span className="text-[8px] font-black">حجب أمني</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center items-center sm:items-start gap-1">
          <h2 className="text-lg font-black text-slate-800">{profileData.fullName}</h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-md font-black flex items-center gap-1">
              🎖️ {profileData.adminPosition || 'متطوع'}
            </span>
            {profileData.isProfileCompleted && (
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-black flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> مكتمل
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* 1️⃣ كارت بيانات الحصر والاتصال */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-50 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black">بيانات العضوية والربط الحصرى</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl">
              <span className="text-gray-400">رقم المتطوع الموحد:</span>
              <span className="font-mono font-bold text-[#7A1C2E]">{profileData.volunteerNumber || volunteerNumber}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl">
              <span className="text-gray-400">الرقم الوطني:</span>
              <span className="font-mono font-bold text-slate-700">{profileData.nationalId || '---'}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl">
              <span className="text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> رقم الهاتف:</span>
              <span className="font-mono font-bold text-slate-700">{profileData.phone || '---'}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl">
              <span className="text-gray-400 flex items-center gap-1">💬 واتساب معتمد:</span>
              <span className="font-mono font-bold text-slate-700">{profileData.whatsapp || '---'}</span>
            </div>
          </div>
        </div>

        {/* 2️⃣ كارت البيانات الشخصية الحصرية لقرار */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-50 pb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black">البيانات الديموغرافية والاجتماعية (قرار)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400">الجنس:</span>
              <span className="font-bold text-slate-700">{translateGender(profileData.gender)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" /> تاريخ الميلاد:</span>
              <span className="font-mono font-bold text-slate-700">{profileData.birthDate || '---'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400 flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> فصيلة الدم:</span>
              <span className="font-bold text-slate-800 bg-red-50 px-2 py-0.5 rounded text-[11px] font-mono">{profileData.bloodType || '---'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400">الحالة الاجتماعية:</span>
              <span className="font-bold text-slate-700">{translateMaritalStatus(profileData.maritalStatus)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2 sm:col-span-2">
              <span className="text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> البريد الإلكتروني:</span>
              <span className="font-mono font-bold text-slate-700">{profileData.email || '---'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400 flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-gray-400" /> المؤهل العلمي:</span>
              <span className="font-bold text-slate-700">{profileData.education || '---'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400 flex items-center gap-1"><Briefcase className="w-3 h-3 text-gray-400" /> المهنة الحالية:</span>
              <span className="font-bold text-slate-700">{profileData.occupation || '---'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2 sm:col-span-2">
              <span className="text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> العنوان بالتفصيل:</span>
              <span className="font-bold text-slate-700">{profileData.address || '---'}</span>
            </div>
            <div className="flex justify-between items-center bg-purple-50/40 p-2.5 rounded-xl sm:col-span-2">
              <span className="text-purple-950 font-black">المكتب المفضل في قرار:</span>
              <span className="font-black text-purple-700 bg-white border border-purple-100 px-2 py-1 rounded-lg shadow-sm">
                {translateOffice(profileData.preferredOffice)}
              </span>
            </div>
          </div>
        </div>

        {/* 3️⃣ كارت السجل التدريبي وـ TOT (المحدث بدون ملفات الشهادات) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-50 pb-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black">سجل التدريب وبناء القدرات وبطاقة TOT</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400">حالة مدرب TOT:</span>
              <span className={`font-black ${profileData.isTotTrainer ? 'text-emerald-600' : 'text-gray-400'}`}>
                {profileData.isTotTrainer ? '✅ مدرب معتمد' : 'لا توجد'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400">سنة الحصول على TOT:</span>
              <span className="font-bold text-slate-700 font-mono">{profileData.totYear || '---'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2 sm:col-span-2">
              <span className="text-gray-400">آخر دورة تنشيطية للإسعافات:</span>
              <span className="font-bold text-slate-700">{profileData.lastFirstAidRefresher || '---'}</span>
            </div>
          </div>
        </div>

        {/* 4️⃣ كارت الجاهزية والموقف الميداني */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-50 pb-2">
            <Activity className="w-4 h-4 text-red-600" />
            <span className="text-xs font-black">الموقف الحركي الميداني وجاهزية الإسناد</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400">الموقف الحالي بالخرطوم:</span>
              <span className="font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{profileData.currentStatusInKhartoum || 'داخل الولاية'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-400">الوقت المتوقع للعودة الميدانية:</span>
              <span className="font-bold text-slate-700">{profileData.expectedReturnTime || 'موجود بالخرطوم حالياً'}</span>
            </div>
            <div className="flex justify-between items-center bg-amber-50/30 border border-amber-100/60 p-2.5 rounded-xl sm:col-span-2">
              <span className="text-amber-950 font-black">مستوى الجاهزية التطوعية المتاحة:</span>
              <span className="font-black text-amber-800">{profileData.availabilityLevel || 'جاهزية كاملة للمهام'}</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
