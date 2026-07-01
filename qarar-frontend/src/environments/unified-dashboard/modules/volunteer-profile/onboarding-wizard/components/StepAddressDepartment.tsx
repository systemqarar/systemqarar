import React from 'react';
import { WizardStepProps } from '../types/onboarding.types';

export const StepAddressDepartment: React.FC<WizardStepProps> = ({ formData, updateFields, nextStep, prevStep }) => {
  // القائمة المعتمدة رسمياً في الوحدة الإدارية
  const departments = [
    'رئيس الوحدة',
    'مكتب السكرتير',
    'المكتب المالي',
    'المكتب الاعلامي',
    'مكتب الخدمات الاجتماعية',
    'مكتب التدريب والشباب',
    'مكتب المرأة والتنمية'
  ];

  const regions = ['الكلاكلة الوحدة', 'الكلاكلة صنقعت', 'الدخينات', 'الإسكان'];
  
  // 🌟 تعديل 1: تطبيق مقترحك الذكي في دمج وتبسيط المؤهلات العلمية وإضافة خيار (دون ذلك)
  const educationLevels = ['دون ذلك', 'ثانوي', 'جامعي', 'فوق الجامعي'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.education_level || !formData.job_title || !formData.main_address || !formData.detailed_address || !formData.desired_department) {
      alert('الرجاء ملء جميع الحقول المطلوبة للانتقال للخطوة التالية');
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-right">
      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
        الاتصال، السكن وتحديد المكتب
      </h3>

      {/* البريد الإلكتروني */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">البريد الإلكتروني :</label>
        <input 
          type="email" placeholder="example@gmail.com"
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all text-left"
          value={formData.email} onChange={e => updateFields({ email: e.target.value })}
        />
      </div>

      {/* المؤهل العلمي */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">المؤهل العلمي :</label>
        <select 
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all bg-white cursor-pointer"
          value={formData.education_level} onChange={e => updateFields({ education_level: e.target.value })}
        >
          <option value="">اختر المؤهل</option>
          {educationLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {/* المهنة الحالية */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">المهنة الحالية :</label>
        <input 
          type="text" placeholder="مثال: طالب، موظف، مهندس"
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all"
          value={formData.job_title} onChange={e => updateFields({ job_title: e.target.value })}
        />
      </div>

      {/* السكن الإداري الرئيسي */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">السكن الإداري الرئيسي :</label>
        <select 
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all bg-white cursor-pointer"
          value={formData.main_address} onChange={e => updateFields({ main_address: e.target.value })}
        >
          <option value="">اختر المنطقة الإدارية</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* تفاصيل العنوان بدقة */}
      {formData.main_address && (
        <div className="p-4 bg-[#800020]/5 border border-[#800020]/20 rounded-2xl transition-all animate-fadeIn">
          <label className="block text-xs font-bold text-[#800020] mb-1.5">تفاصيل العنوان بدقة (المربع، الحي، أقرب معلم بارز) :</label>
          <textarea 
            rows={2} placeholder="اكتب المربع، اسم الحي، وبناية أو محطة شهيرة بقربك..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all bg-white"
            value={formData.detailed_address} onChange={e => updateFields({ detailed_address: e.target.value })}
          />
        </div>
      )}

      {/* المكتب الإداري المفضل */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">المكتب الإداري الذي تفضل العمل به :</label>
        <select 
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all bg-white cursor-pointer"
          value={formData.desired_department} onChange={e => updateFields({ desired_department: e.target.value })}
        >
          <option value="">اختر المكتب المفضّل</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* أزرار التحكم المتناسقة مع تجربة الموبايل والداشبورد */}
      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={prevStep} 
          className="w-1/3 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm active:scale-95 hover:bg-gray-200/70 transition-all"
        >
          السابق
        </button>
        <button 
          type="submit" 
          className="w-2/3 py-3.5 bg-[#800020] text-white font-bold rounded-xl text-sm active:scale-95 hover:bg-[#800020]/90 transition-all shadow-sm"
        >
          التالي
        </button>
      </div>
    </form>
  );
};
