// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/hooks/useOnboardingWizard.ts

import { useState } from 'react';
import { OnboardingFormData } from '../types/onboarding.types';
import { submitOnboardingData } from '../api/onboardingApi';

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

// دالة مساعدة لرفع الصور مباشرة إلى كلاودنري من الفرونت إند (بدون أي تغيير)
const uploadToCloudinary = async (base64String: string): Promise<string> => {
  if (!base64String || base64String.startsWith('http')) {
    return base64String;
  }

  const env = (import.meta as any).env || {};
  const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET; 

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('المتغيرات VITE_CLOUDINARY_CLOUD_NAME أو VITE_CLOUDINARY_UPLOAD_PRESET غير معرفة في Vercel');
  }

  const formData = new FormData();
  formData.append('file', base64String);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`كلاودنري رفض الرفع: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url; 
};

export const useOnboardingWizard = (onComplete: () => void) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🤖 1. الـ State المعيارية الجديدة للتحكم في رسائل غيث المنبثقة
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
    setGhaithMessage(null); // تصفير أي رسالة سابقة عند بدء المحاولة الجديدة
    
    try {
      let finalPhotoUrl = formData.photo_url;

      // 1. مرحلة رفع الصورة لكلاودنري إن وجدت وكانت عبارة عن ملف خام أو Base64 ولم تُرفع بعد
      if (formData.photo_url && !formData.photo_url.startsWith('http')) {
        try {
          finalPhotoUrl = await uploadToCloudinary(formData.photo_url);
        } catch (cloudinaryError: any) {
          alert(`❌ [مشكلة في كلاودنري]: ${cloudinaryError?.message || cloudinaryError}`);
          throw cloudinaryError;
        }
      }

      // تجهيز كائن البيانات النهائي النظيف والآمن
      const cleanedFormData: OnboardingFormData = {
        ...formData,
        photo_url: finalPhotoUrl,
        secure_photo_url: '', 
      };

      // 2. مرحلة الحفظ في سيرفر قاعدة البيانات (Backend) وفحص مخرجات غيث
      try {
        const res = await submitOnboardingData(cleanedFormData);
        if (res.success) {
          onComplete();
        } else {
          alert('❌ [رفض من السيرفر]: السيرفر استلم البيانات لكن رفض الحفظ.');
        }
      } catch (apiError: any) {
        // استخراج كود الخطأ والرسالة الحقيقية الراجعة من السيرفر
        const statusCode = apiError.response?.status; 
        const serverMessage = apiError.response?.data?.message || apiError.response?.data || apiError.message;

        // 🎯 2. الحتة السحرية المعيارية: لو الخطأ كود 400 (وهو الكود المخصص لرفض غيث للصورة الشخصية)
        // نقوم بحقن الرسالة المنسكبة في الـ State ليتم عرضها في المودال المنبثق فوراً بدل الأليرت
        if (statusCode === 400 && apiError.response?.data?.message) {
          setGhaithMessage(serverMessage);
        } else {
          // باقي الأخطاء التقنية (أخطاء السيرفر 500 أو انقطاع الشبكة) تظهر كـ Alert طبيعي كما كانت
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

  // 3. تمرير الـ State ودالة التحكم للخارج لتستفيد منها صفحة الـ Page
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
