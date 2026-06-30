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
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">البيانات الديموغرافية والاجتماعية</h3>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">الجنس :</label>
        <select 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={formData.gender}
          onChange={e => updateFields({ gender: e.target.value as 'ذكر' | 'أنثى' })}
        >
          <option value="">اختر الجنس</option>
          <option value="ذكر">ذكر</option>
          <option value="أنثى">أنثى</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">تاريخ الميلاد :</label>
        <input 
          type="date" 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
          value={formData.date_of_birth}
          onChange={e => updateFields({ date_of_birth: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">الحالة الاجتماعية :</label>
        <select 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={formData.marital_status}
          onChange={e => updateFields({ marital_status: e.target.value })}
        >
          <option value="">اختر الحالة الاجتماعية</option>
          <option value="أعزب">أعزب / عزباء</option>
          <option value="متزوج">متزوج / متزوجة</option>
          <option value="مطلق">مطلق / مطلقة</option>
          <option value="أرمل">أرمل / أرملة</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">فصيلة الدم :</label>
        <select 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={formData.blood_type}
          onChange={e => updateFields({ blood_type: e.target.value })}
        >
          <option value="">اختر فصيلة الدم</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
        التالي
      </button>
    </form>
  );
};
