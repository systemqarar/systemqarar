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
    <div className="space-y-5">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">الصورة الشخصية الرسمية والأمان</h3>

      {/* تنبيه تحميل النظام الذكي */}
      {isModelLoading && (
        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg animate-pulse text-center font-bold">
          ⏳ جاري تشغيل نظام التدقيق الذكي وفحص معايير الجودة الرسمية...
        </div>
      )}

      <AnimatePresence>
        {formData.gender === 'أنثى' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 rounded-lg border border-red-200"
          >
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" id="niqab" className="w-5 h-5 text-red-600 focus:ring-red-500 rounded"
                checked={formData.is_niqabi}
                onChange={e => updateFields({ is_niqabi: e.target.checked })}
              />
              <label htmlFor="niqab" className="font-bold text-gray-800 cursor-pointer">هل المتطوعة منقبة؟</label>
            </div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              🛡️ لحمايتكِ.. عند تفعيل this الخيار، سيقوم النظام تلقائياً بتشفير صورتكِ وتحويلها إلى نسخة ضبابية تماماً لا تظهر معالمها لأي مستخدم، بينما تُحفظ الصورة الرسمية في خادم آمن جداً للمعاملات الإدارية المعتمدة والشهادات فقط.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض الأخطاء إن وجدت */}
      {errorMessage && (
        <div className="p-3 bg-red-100 text-red-700 font-bold text-sm rounded-lg border border-red-300 leading-relaxed">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 bg-gray-50 relative min-h-[200px]">
        {isValidating ? (
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-600">جاري فحص ملامح وأبعاد الصورة بالذكاء الاصطناعي...</p>
          </div>
        ) : preview ? (
          <div className="text-center">
            <div className="relative mx-auto w-32 h-32 mb-3">
              <img 
                src={preview} alt="Profile Preview" 
                className={`w-32 h-32 object-cover rounded-xl border-4 border-white shadow-md transition-all ${formData.is_niqabi ? 'blur-md' : ''}`} 
              />
              {formData.is_niqabi && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold rounded-xl p-1 text-center">
                  محجوبة بخصوصية فائقة
                </span>
              )}
            </div>
            <button 
              type="button"
              onClick={clearPhoto} 
              className="text-xs font-bold text-red-600 underline"
            >
              تغيير الصورة
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">ارفع صورتك الرسمية هنا</p>
            <label className={`px-4 py-2 bg-white border shadow-sm rounded-lg font-bold text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition ${isModelLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              اختيار ملف الصورة
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isModelLoading} />
            </label>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={prevStep} disabled={isSubmitting || isValidating} className="w-1/3 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">
          السابق
        </button>
        <button 
          type="button" onClick={onFinalSubmit} 
          disabled={isSubmitting || isValidating || !preview}
          className="w-2/3 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'جاري حفظ البيانات ودخول المنظومة...' : 'إكمال الملف والانتقال للوحة التحكم'}
        </button>
      </div>
    </div>
  );
};
