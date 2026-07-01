// unified-dashboard/modules/volunteer-profile/onboarding-wizard/components/StepPhotoSecure.tsx

import React from 'react';
import { WizardStepProps } from '../types/onboarding.types';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotoVerification } from '../hooks/usePhotoVerification'; // 🚀 استدعاء الهوك الذكي حقنا

export const StepPhotoSecure: React.FC<WizardStepProps & { isSubmitting: boolean; onFinalSubmit: () => void }> = ({
  formData, updateFields, prevStep, isSubmitting, onFinalSubmit
}) => {
  
  // 🎯 استدعاء كل منطق الذكاء الاصطناعي في سطر واحد فقط!
  const {
    preview,
    isModelLoading,
    isValidating,
    errorMessage,
    handlePhotoChange,
    clearPhoto
  } = usePhotoVerification({
    initialPhotoUrl: formData.photo_url || null,
    updateFields
  });

  return (
    <div className="space-y-5 text-right">
      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
        الصورة الشخصية الرسمية والأمان
      </h3>

      {/* تنبيه تحميل النظام الذكي بتنسيق أنيق وهادئ */}
      {isModelLoading && (
        <div className="p-3.5 bg-blue-50/60 border border-blue-100 text-blue-800 text-xs rounded-xl animate-pulse text-center font-bold">
          ⏳ جاري تشغيل نظام التدقيق الذكي وفحص معايير الجودة الرسمية...
        </div>
      )}

      {/* منطقة خيار النقاب والحماية الخاصة بالمتطوعات */}
      <AnimatePresence>
        {formData.gender === 'أنثى' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-[#800020]/5 rounded-2xl border border-[#800020]/10"
          >
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" id="niqab" 
                className="w-5 h-5 text-[#800020] focus:ring-[#800020] rounded-lg cursor-pointer accent-[#800020]"
                checked={formData.is_niqabi}
                onChange={e => updateFields({ is_niqabi: e.target.checked })}
              />
              <label htmlFor="niqab" className="text-sm font-bold text-gray-800 cursor-pointer select-none">هل المتطوعة منقبة؟</label>
            </div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              🛡️ لحمايتكِ.. عند تفعيل هذا الخيار، سيقوم النظام تلقائياً بتشفير صورتكِ وتحويلها إلى نسخة ضبابية تماماً لا تظهر معالمها لأي مستخدم، بينما تُحفظ الصورة الرسمية في خادم آمن جداً للمعاملات الإدارية المعتمدة والشهادات فقط.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض الأخطاء إن وجدت بشكل متناسق */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200/60 leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* الحاوية المحدثة لرفع وفحص الصورة الشخصية */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-[#f8f9fa] relative min-h-[220px] transition-all">
        {isValidating ? (
          <div className="text-center space-y-3">
            <div className="w-9 h-9 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-600">جاري فحص ملامح وأبعاد الصورة بالذكاء الاصطناعي...</p>
          </div>
        ) : preview ? (
          <div className="text-center">
            <div className="relative mx-auto w-32 h-32 mb-3">
              <img 
                src={preview} alt="Profile Preview" 
                className={`w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-md transition-all duration-300 ${formData.is_niqabi ? 'blur-md' : ''}`} 
              />
              {formData.is_niqabi && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-[11px] font-bold rounded-2xl p-2 text-center leading-normal">
                  محجوبة بخصوصية فائقة
                </span>
              )}
            </div>
            <button 
              type="button"
              onClick={clearPhoto} 
              className="text-xs font-bold text-[#800020] underline hover:text-[#800020]/80 transition-colors"
            >
              تغيير الصورة
            </button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-xs font-medium text-gray-500">ارفع صورتك الرسمية هنا</p>
            <label className={`inline-flex px-5 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl font-bold text-xs text-gray-700 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all ${isModelLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              اختيار ملف الصورة
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isModelLoading} />
            </label>
          </div>
        )}
      </div>

      {/* أزرار التحكم النهائية المتوافقة مع أسلوب وعناصر النظام المطور */}
      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={prevStep} 
          disabled={isSubmitting || isValidating} 
          className="w-1/3 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm active:scale-95 hover:bg-gray-200/70 transition-all disabled:opacity-50"
        >
          السابق
        </button>
        <button 
          type="button" 
          onClick={onFinalSubmit} 
          disabled={isSubmitting || isValidating || !preview}
          className="w-2/3 py-3.5 bg-[#800020] text-white font-bold rounded-xl text-sm active:scale-95 hover:bg-[#800020]/90 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? 'جاري حفظ البيانات ودخول المنظومة...' : 'إكمال الملف والانتقال للوحة التحكم'}
        </button>
      </div>
    </div>
  );
};
