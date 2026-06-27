import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Upload, Check, EyeOff, ShieldCheck, User, Loader2 } from 'lucide-react';

export const PersonalDataPage = ({ onBack }: { onBack: () => void }) => {
  // --- 🌐 إعدادات روابط السيرفر (Render) ---
  const BACKEND_URL = 'https://systemqarar.onrender.com/api/volunteer/profile'; 
  const VOLUNTEER_ID = 'SRC-KRT-2026-88'; // رقم العضوية الحالي المستهدف

  // --- حالات التحميل وحفظ البيانات الحية ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- خانات الحصر الثابتة (تأتي من السيرفر) ---
  const [fixedData, setFixedData] = useState({
    fullName: "جاري التحميل...",
    volunteerId: VOLUNTEER_ID,
    nationalId: "------------"
  });

  // --- خانات الإدخال القابلة للتعديل والحفظ ---
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [email, setEmail] = useState('');
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [preferredOffice, setPreferredOffice] = useState('');
  const [isNiqabi, setIsNiqabi] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 🔄 1. سحب البيانات حياً من ريندر فور فتح الشاشة
  useEffect(() => {
    fetch(`${BACKEND_URL}/${VOLUNTEER_ID}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          const d = resData.data;
          // صب بيانات الحصر الثابتة
          setFixedData({
            fullName: d.fullName || "بلا اسم",
            volunteerId: d.volunteerId || VOLUNTEER_ID,
            nationalId: d.nationalId || "-------"
          });
          // صب البيانات الاختيارية لو كانت محفوظة مسبقاً
          setGender(d.gender || '');
          setBirthDate(d.birthDate ? d.birthDate.split('T')[0] : '');
          setBloodType(d.bloodType || '');
          setMaritalStatus(d.maritalStatus || '');
          setEmail(d.email || '');
          setEducation(d.education || '');
          setOccupation(d.occupation || '');
          setAddress(d.address || '');
          setPreferredOffice(d.preferredOffice || '');
          setIsNiqabi(d.isNiqabi || false);
          setImagePreview(d.profileImageUrl || null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("خطأ في جلب بيانات قرار:", err);
        setLoading(false);
      });
  }, []);

  // 📥 2. دالة إرسال وحفظ البيانات الشخصية في قاعدة البيانات (Neon)
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    const payload = {
      volunteerId: fixedData.volunteerId,
      fullName: fixedData.fullName,
      nationalId: fixedData.nationalId,
      gender,
      birthDate: birthDate || null,
      bloodType,
      maritalStatus,
      email,
      education,
      occupation,
      address,
      preferredOffice,
      isNiqabi,
      profileImageUrl: imagePreview
    };

    try {
      const response = await fetch(`${BACKEND_URL}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message || 'فشل الحفظ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل الاتصال بسيرفر منظومة قرار' });
    } finally {
      setSaving(false);
    }
  };

  // معالجة اختيار الصورة مؤقتاً في الواجهة
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (x) => setImagePreview(x.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A1C2E]" />
        <span className="text-xs font-bold font-sans">جاري قراءة بياناتك من منظومة قرار...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full text-right pb-10"
      dir="rtl"
    >
      {/* 🔝 الهيدر وزرار الرجوع الذكي للداشبورد */}
      <div className="flex justify-between items-center mb-6 px-1">
        <h1 className="text-xl font-black text-slate-900">تحديث البيانات الأساسية</h1>
        <button 
          onClick={onBack}
          className="text-xs font-bold text-[#7A1C2E] bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 active:scale-95 transition-transform"
        >
          رجوع للرئيسية ⬅️
        </button>
      </div>

      {/* 🔔 رسائل الإشعار بنجاح أو فشل الحفظ */}
      {message && (
        <div className={`p-3.5 mb-5 rounded-xl text-xs font-bold text-center border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 🛡️ كرت بيانات الحصر الرسمية (قفل أمني رمادي) */}
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

      {/* 📸 كرت الصورة الشخصية الرسمي مع ميزة الحجب للمنقبات */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm flex flex-col items-center text-center">
        <span className="text-xs font-black text-slate-800 self-start mb-3">الصورة الشخصية للبطاقة الرقمية</span>
        
        <div className="relative w-28 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className={`w-full h-full object-cover transition-all duration-300 ${gender === 'female' && isNiqabi ? 'blur-md scale-105' : ''}`} 
            />
          ) : (
            <User className="w-10 h-10 text-gray-300 stroke-[1.2]" />
          )}

          {gender === 'female' && isNiqabi && imagePreview && (
            <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center text-white p-1 backdrop-blur-sm">
              <EyeOff className="w-5 h-5 mb-1 text-white" />
              <span className="text-[9px] font-black">الصورة مخفية</span>
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

        {gender === 'female' && (
          <motion.label 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 mt-4 p-2.5 bg-purple-50/50 border border-purple-100 rounded-xl w-full cursor-pointer select-none text-right"
          >
            <input 
              type="checkbox" 
              checked={isNiqabi} 
              onChange={(e) => setIsNiqabi(e.target.checked)}
              className="w-4 h-4 accent-purple-700" 
            />
            <div>
              <p className="text-xs font-black text-purple-950">العضو منقبة (تفعيل الحجب الأمني)</p>
              <p className="text-[9px] text-purple-600">سيتم تشويش الصورة في البروفايل تلقائياً وحفظ الأصلية للشهادات فقط.</p>
            </div>
          </motion.label>
        )}
      </div>

      {/* 📝 نموذج الخانات الإضافية الجديدة */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* 1. الجنس */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">الجنس</label>
          <select 
            value={gender} 
            onChange={(e) => { setGender(e.target.value); if(e.target.value !== 'female') setIsNiqabi(false); }}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]"
          >
            <option value="">اختر الجنس</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>

        {/* 2. تاريخ الميلاد */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">تاريخ الميلاد</label>
          <input 
            type="date" 
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]" 
          />
        </div>

        {/* 3. فصيلة الدم */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">فصيلة الدم</label>
          <select 
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]"
          >
            <option value="">اختر الفصيلة</option>
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* 4. الحالة الاجتماعية */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">الحالة الاجتماعية</label>
          <select 
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]"
          >
            <option value="">اختر الحالة</option>
            <option value="single">عازب/ة</option>
            <option value="married">متزوج/ة</option>
            <option value="other">غير ذلك</option>
          </select>
        </div>

        {/* 5. البريد الإلكتروني */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">البريد الإلكتروني</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com" 
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold text-left text-slate-800 focus:outline-none focus:border-[#7A1C2E]" 
          />
        </div>

        {/* 6. المؤهل العلمي */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">المؤهل العلمي</label>
          <input 
            type="text" 
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="ثانوي، دبلوم، بكالوريوس هندسة..." 
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]" 
          />
        </div>

        {/* 7. المهنة أو الوظيفة الحالية */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">المهنة أو الوظيفة الحالية</label>
          <input 
            type="text" 
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="طالب، مهندس، أعمال حرة..." 
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]" 
          />
        </div>

        {/* 8. Sكن بالتفصيل */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">السكن بالتفصيل</label>
          <textarea 
            rows={2} 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="المدينة، الحي، الحارة، أقرب معلم بارز..." 
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E] resize-none" 
          />
        </div>

        {/* 9. المكتب الذي ترى نفسك فيه */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5">المكتب الذي ترى نفسك فيه</label>
          <select 
            value={preferredOffice}
            onChange={(e) => setPreferredOffice(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7A1C2E]"
          >
            <option value="">اختر المكتب المفضل</option>
            <option value="emergency">الطوارئ والإسعافات</option>
            <option value="health">الصحة والرعاية الطبية</option>
            <option value="media">الإعلام والتوثيق</option>
            <option value="training">التدريب وبناء القدرات</option>
          </select>
        </div>

        {/* 🔒 10. المنصب الإداري بالوحدة (مقفل أمنياً من واجهة المتطوع) */}
        <div>
          <label className="block text-xs font-black text-gray-400 mb-1.5 flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-600" /> المنصب الإداري الحالي بالوحدة
          </label>
          <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-500 flex justify-between items-center select-none">
            <span>متطوع</span>
            <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-black">يُعدل بواسطة الإدارة فقط</span>
          </div>
        </div>

        {/* 💾 زر الحفظ الفعلي المتصل بـ Render */}
        <button 
          type="button"
          onClick={handleSaveProfile}
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
              حفظ وتحديث البيانات الشخصية
            </>
          )}
        </button>

      </div>
    </motion.div>
  );
};
