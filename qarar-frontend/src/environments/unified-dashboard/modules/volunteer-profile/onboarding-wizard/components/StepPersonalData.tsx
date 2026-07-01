import React from 'react';
import { WizardStepProps } from '../types/onboarding.types';

export const StepPersonalData: React.FC<WizardStepProps> = ({ formData, updateFields, nextStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gender || !formData.date_of_birth || !formData.marital_status || !formData.blood_type) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-right">
      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
        البيانات الديموغرافية والاجتماعية
      </h3>
      
      {/* الجنس */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">الجنس :</label>
        <select 
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all bg-white cursor-pointer"
          value={formData.gender}
          onChange={e => updateFields({ gender: e.target.value as 'ذكر' | 'أنثى' })}
        >
          <option value="">اختر الجنس</option>
          <option value="ذكر">ذكر</option>
          <option value="أنثى">أنثى</option>
        </select>
      </div>

      {/* تاريخ الميلاد */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ الميلاد :</label>
        <input 
          type="date" 
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all"
          value={formData.date_of_birth}
          onChange={e => updateFields({ date_of_birth: e.target.value })}
        />
      </div>

      {/* الحالة الاجتماعية */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">الحالة الاجتماعية :</label>
        <select 
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all bg-white cursor-pointer"
          value={formData.marital_status}
          onChange={e => updateFields({ marital_status: e.target.value })}
        >
          <option value="">اختر الحالة الاجتماعية</option>
          {/* 🌟 تطبيق مقترحك لتبسيط الخيارات وحفظ خصوصية البيانات */}
          <option value="أعزب">أعزب</option>
          <option value="متزوج">متزوج</option>
          <option value="غير ذلك">غير ذلك</option>
        </select>
      </div>

      {/* فصيلة الدم */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">فصيلة الدم :</label>
        <select 
          className="w-full p-3 bg-[#f8f9fa] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] focus:bg-white transition-all bg-white cursor-pointer"
          value={formData.blood_type}
          onChange={e => updateFields({ blood_type: e.target.value })}
        >
          <option value="">اختر فصيلة الدم</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* زر الانتقال المتناسق */}
      <div className="pt-2">
        <button 
          type="submit" 
          className="w-full py-3.5 bg-[#800020] text-white font-bold rounded-xl text-sm active:scale-95 hover:bg-[#800020]/90 transition-all shadow-sm"
        >
          التالي
        </button>
      </div>
    </form>
  );
};
