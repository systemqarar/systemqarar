 import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Upload, Check, EyeOff, ShieldCheck, User, Loader2 } from 'lucide-react';
import { usePersonalData } from '../hooks/usePersonalData';

interface PersonalDataPageProps {
  volunteerId: string; // يُمرر ديناميكياً من الـ Auth Context الحالي
  onBack?: () => void;
}

export const PersonalDataPage: React.FC<PersonalDataPageProps> = ({ volunteerId, onBack }) => {
  // استدعاء المحرك النظيف
  const {
    loading,
    saving,
    message,
    fixedData,
    formData,
    setFormData,
    savePersonalData,
    isCompleted,
  } = usePersonalData(volunteerId);

  // تحديث الحقول في الـ Form
  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // معالجة اختيار الصورة مؤقتاً (لحين إضافة الـ Cropper في مجلد components)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (x) => handleInputChange('profileImageUrl', x.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A1C2E]" />
        <span className="text-xs font-bold">جاري قراءة بياناتك من منظومة قرار...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full text-right pb-10 max-w-3xl mx-auto"
      dir="rtl"
    >
      {/* 🔝 الهيدر وزرار الرجوع (يختفي إجبارياً لو المتطوع لم يكمل بياناته أول مرة) */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h1 className="text-xl font-black text-slate-900">تحديث البيانات الأساسية</h1>
          {!isCompleted && (
            <p className="text-[11px] text-amber-600 font-bold mt-1">⚠️ يرجى إكمال الـ 11 خانة المطلوبة لتفعيل حسابك في المنظومة</p>
          )}
        </div>
        
        {/* زر الرجوع يظهر فقط إذا كان الملف الشخصي مكتمل مسبقاً وصلاحية الرجوع متاحة */}
        {isCompleted && onBack && (
          <button 
            onClick={onBack}
            className="text-xs font-bold text-[#7A1C2E] bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 active:scale-95 transition-transform"
          >
            رجوع للرئيسية ⬅️
          </button>
        )}
      </div>

      {/* 🔔 رسائل الإشعار بنجاح أو فشل الحفظ */}
      {message && (
        <div className={`p-3.5 mb-5 rounded-xl text-xs font-bold text-center border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 🛡️ كرت بيانات الحصر الرسمية الثابتة */}
      <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] font-black tracking-wide">بيانات العضوية الرسمية (نظام الحصر)</span>
        </div>
        <div className="grid grid-cols-1 gap-3 text-xs">
          <div className="flex justify-between border-b border-gray-200/50 pb-2">
            <span className="text-gray-400">الاسم الكامل:</span>
            <span className="font-bold text-slate-700">{fixedData.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200/50 pb-2">
            <span className="text-gray-400">رقم العضوية:</span>
            <span className="font-mono font-bold text-[#7A1C2E]">{fixedData.volunteerId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">الرقم الوطني:</span>
            <span className="font-mono font-bold text-slate-700">{fixedData.nationalId}</span>
          </div>
        </div>
      </div>

      {/* 📸 كرت الصورة الشخصية ومعالجة حجب المنقبات */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm flex flex-col items-center text-center">
        <span className="text-xs font-black text-slate-800 self-start mb-3">الصورة الشخصية للبطاقة الرقمية</span>
        
        <div className="relative w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
          {formData.profileImageUrl ? (
            <img 
              src={formData.profileImageUrl} 
              alt="Preview" 
              className={`w-full h-full object-cover transition-all duration-300 ${formData.gender === 'female' && formData.isNiqabi ? 'blur-md scale-105' : ''}`} 
            />
          ) : (
            <User className="w-10 h-10 text-gray-300 stroke-[1.2]" />
          )}

          {formData.gender === 'female' && formData.isNiqabi && formData.profileImageUrl && (
            <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center text-white p-1 backdrop-blur-sm">
              <EyeOff className="w-5 h-5 mb-1 text-white" />
              <span className="text-[9px] font-black">الصورة مخفية نظاماً</span>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md active:scale-95 transition-all mb-2">
          <Upload className="w-3.5 h-3.5" />
          اختيار صورة رسمية
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
        <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
          يفضل صورة واضحة الملامح وبخلفية سادة (مقاس صور الجوازات).
        </p>

        {formData.gender === 'female' && (
          <motion.label 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 mt-4 p-2.5 bg-purple-50/50 border border-purple-100 rounded-xl w-full cursor-pointer select-none text-right"
          >
            <input 
              type="checkbox" 
              checked={formData.isNiqabi} 
              onChange={(e) => {
                handleInputChange('isNiqabi', e.target.checked);
              }}
              className="w-4 h-4 accent-purple-700" 
            />
            <div>
              <p className="text-xs font-black text-purple-950">العضو منقبة (تفعيل الحجب الأمني)</p>
              <p className="text-[9px] text-purple-600">سيتم تشويش الصورة في الواجهة تلقائياً ويحتفظ السيرفر بالأصل للشهادات الرسمية.</p>
            </div>
          </motion.label>
        )}
      </div>

      {/* 📝 نموذج الـ 11 خانة الجديدة */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">الجنس</label>
          <select 
            value={formData.gender} 
            onChange={(e) => { 
              handleInputChange('gender', e.target.value);
              if(e.target.value !== 'female') handleInputChange('isNiqabi', false);
            }}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]"
          >
            <option value="">اختر الجنس</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">تاريخ الميلاد</label>
          <input 
            type="date" 
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]" 
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">فصيلة الدم</label>
          <select 
            value={formData.bloodType}
            onChange={(e) => handleInputChange('bloodType', e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]"
          >
            <option value="">اختر الفصيلة</option>
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">الحالة الاجتماعية</label>
          <select 
            value={formData.maritalStatus}
            onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]"
          >
            <option value="">اختر الحالة</option>
            <option value="single">عازب/ة</option>
            <option value="married">متزوج/ة</option>
            <option value="other">غير ذلك</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">البريد الإلكتروني</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="example@mail.com" 
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold text-left text-slate-800 focus:outline-none focus:border-[#7A1C2E]" 
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">المؤهل العلمي</label>
          <input 
            type="text" 
            value={formData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            placeholder="ثانوي، دبلوم، بكالوريوس هندسة..." 
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]" 
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">المهنة أو الوظيفة الحالية</label>
          <input 
            type="text" 
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            placeholder="طالب، مهندس، أعمال حرة..." 
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]" 
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">السكن بالتفصيل</label>
          <textarea 
            rows={2} 
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="المدينة، الحي، الحارة..." 
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E] resize-none" 
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">المكتب الذي ترى نفسك فيه</label>
          <select 
            value={formData.preferredOffice}
            onChange={(e) => handleInputChange('preferredOffice', e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]"
          >
            <option value="">اختر المكتب المفضل</option>
            <option value="emergency">الطوارئ والإسعافات</option>
            <option value="health">الصحة والرعاية الطبية</option>
            <option value="media">الإعلام والتوثيق</option>
            <option value="training">التدريب وبناء القدرات</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 mb-1.5 flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-600" /> المنصب الإداري الحالي بالوحدة
          </label>
          <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-500 flex justify-between items-center select-none">
            <span>متطوع</span>
            <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-black">يُعدل بواسطة الإدارة فقط</span>
          </div>
        </div>

        {/* 💾 زر الحفظ والمزامنة الفعلي */}
        <button 
          type="button"
          onClick={savePersonalData}
          disabled={saving}
          className="w-full mt-4 bg-[#7A1C2E] hover:bg-[#631423] disabled:bg-slate-400 text-white font-black text-sm py-3 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري مزامنة البيانات مع قرار...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              حفظ وتأكيد البيانات الشخصية
            </>
          )}
        </button>

      </div>
    </motion.div>
  );
};
