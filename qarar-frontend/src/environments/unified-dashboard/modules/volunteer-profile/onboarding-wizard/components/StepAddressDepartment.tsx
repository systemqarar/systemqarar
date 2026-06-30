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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.education_level || !formData.job_title || !formData.main_address || !formData.detailed_address || !formData.desired_department) {
      alert('الرجاء ملء جميع الحقول المطلوبة للانتقال للخطوة التالية');
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">الاتصال، السكن وتحديد المكتب</h3>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني :</label>
        <input 
          type="email" placeholder="example@gmail.com"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 text-left"
          value={formData.email} onChange={e => updateFields({ email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">المؤهل العلمي :</label>
        <select 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={formData.education_level} onChange={e => updateFields({ education_level: e.target.value })}
        >
          <option value="">اختر المؤهل</option>
          <option value="ثانوي">ثانوي</option>
          <option value="دبلوم">دبلوم</option>
          <option value="بكالوريوس">بكالوريوس</option>
          <option value="ماجستير">ماجستير</option>
          <option value="دكتوراه">دكتوراه</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">المهنة الحالية :</label>
        <input 
          type="text" placeholder="مثال: طالب، موظف، مهندس"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
          value={formData.job_title} onChange={e => updateFields({ job_title: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">السكن الإداري الرئيسي :</label>
        <select 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={formData.main_address} onChange={e => updateFields({ main_address: e.target.value })}
        >
          <option value="">اختر المنطقة الإدارية</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {formData.main_address && (
        <div className="p-4 bg-gray-50 border border-dashed rounded-lg">
          <label className="block text-sm font-semibold text-red-700 mb-1">تفاصيل العنوان بدقة (المربع، الحي، أقرب معلم بارز) :</label>
          <textarea 
            rows={2} placeholder="اكتب المربع، اسم الحي، وبناية أو محطة شهيرة بقربك..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
            value={formData.detailed_address} onChange={e => updateFields({ detailed_address: e.target.value })}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">المكتب الإداري الذي تفضل العمل به :</label>
        <select 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={formData.desired_department} onChange={e => updateFields({ desired_department: e.target.value })}
        >
          <option value="">اختر المكتب المفضّل</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={prevStep} className="w-1/3 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">
          السابق
        </button>
        <button type="submit" className="w-2/3 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
          التالي
        </button>
      </div>
    </form>
  );
};
