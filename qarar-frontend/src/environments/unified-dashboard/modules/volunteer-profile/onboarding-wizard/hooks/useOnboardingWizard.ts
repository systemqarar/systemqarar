// src/environments/unified-dashboard/modules/volunteer-profile/onboarding-wizard/hooks/useOnboardingWizard.ts

import { useState } from 'react';
import { OnboardingFormData } from '../types/onboarding.types';
import { submitOnboardingData } from '../api/onboardingApi';
import { uploadToCloudinary } from '../../../../../../api/cloudinaryService'; // 👈 استدعاء الدالة الموحدة من الملف الرئيسي الجديد

const initialData: OnboardingFormData = {
  gender: '',
  date_of_birth: '',
  marital_status: '',
  blood_type: '',
  email: '',
  education_level: '',
  job_title: '',
  main_address: '',
  detailed_address: '',
  desired_department: '',
  is_niqabi: false,
  photo_url: '',
  secure_photo_url: '',
};

export const useOnboardingWizard = (onComplete: () => void) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🤖 التحكم في رسائل غيث المنبثقة
  const [ghaithMessage, setGhaithMessage] = useState<string | null>(null);

  const updateFields = (fields: Partial<OnboardingFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };
      if (fields.gender === 'ذكر') {
        updated.is_niqabi = false;
      }
      return updated;
    });
  };

  const nextStep = () => setCurrentStep((i) => i + 1);
  const prevStep = () => setCurrentStep((i) => i - 1);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setGhaithMessage(null); 
    
    try {
      let finalPhotoUrl = formData.photo_url;

      // 1. مرحلة الرفع عبر الخدمة الموحدة الجديدة (بأعلى جودة وسرعة بعد الضغط)
      if (formData.photo_url && !formData.photo_url.startsWith('http')) {
        try {
          finalPhotoUrl = await uploadToCloudinary(formData.photo_url);
        } catch (cloudinaryError: any) {
          alert(`❌ [مشكلة في كلاودنري]: ${cloudinaryError?.message || cloudinaryError}`);
          throw cloudinaryError;
        }
      }

      // تجهيز كائن البيانات النهائي
      const cleanedFormData: OnboardingFormData = {
        ...formData,
        photo_url: finalPhotoUrl,
        secure_photo_url: '', 
      };

      // 2. مرحلة الحفظ في سيرفر قاعدة البيانات وفحص مخرجات غيث
      try {
        const res = await submitOnboardingData(cleanedFormData);
        if (res.success) {
          onComplete();
        } else {
          alert('❌ [رفض من السيرفر]: السيرفر استلم البيانات لكن رفض الحفظ.');
        }
      } catch (apiError: any) {
        const statusCode = apiError.response?.status; 
        const serverMessage = apiError.response?.data?.message || apiError.response?.data || apiError.message;

        if (statusCode === 400 && apiError.response?.data?.message) {
          setGhaithMessage(serverMessage);
        } else {
          alert(`❌ [خطأ من سيرفر الـ Backend]:\n- رمز الخطأ (Status): ${statusCode || 'مشكلة شبكة / اتصال مقطوع'}\n- تفاصيل السيرفر: ${JSON.stringify(serverMessage)}`);
        }
        throw apiError;
      }

    } catch (error) {
      console.error('Submit Flow Failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    formData,
    updateFields,
    nextStep,
    prevStep,
    handleFinalSubmit,
    isSubmitting,
    ghaithMessage,
    setGhaithMessage,
  };
};
