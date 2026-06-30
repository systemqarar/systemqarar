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

// دالة مساعدة لرفع الصور مباشرة إلى كلاودنري من الفرونت إند
const uploadToCloudinary = async (base64String: string): Promise<string> => {
  if (!base64String || base64String.startsWith('http')) {
    return base64String;
  }

  // 🎯 تعديل ذكي: الكود الآن يقرأ الاسم والبريسيت من إعدادات Vercel اللي ضفتها تلقائياً
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

  const formData = new FormData();
  formData.append('file', base64String);
  formData.append('upload_preset', UPLOAD_PRESET);

  // 🛠️ تصليح الخطأ القاتل: أضفنا حقل الـ body لتمرير بيانات الصورة المرسلة بنجاح
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData, // <--- هسي كدا الصورة حتوصل لكلاودنري بأمان
  });

  if (!response.ok) {
    throw new Error('فشل رفع الصورة إلى Cloudinary');
  }

  const data = await response.json();
  return data.secure_url; // إرجاع الرابط الآمن المباشر للصورة
};

export const useOnboardingWizard = (onComplete: () => void) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      let finalPhotoUrl = '';
      let finalSecurePhotoUrl = '';

      if (formData.photo_url) {
        const uploadedOriginalUrl = await uploadToCloudinary(formData.photo_url);

        if (formData.is_niqabi) {
          finalSecurePhotoUrl = uploadedOriginalUrl;
          finalPhotoUrl = uploadedOriginalUrl.replace('/upload/', '/upload/e_blur:2000,f_auto,q_auto/');
        } else {
          finalPhotoUrl = uploadedOriginalUrl;
          finalSecurePhotoUrl = ''; 
        }
      }

      const cleanedFormData: OnboardingFormData = {
        ...formData,
        photo_url: finalPhotoUrl,
        secure_photo_url: finalSecurePhotoUrl,
      };

      const res = await submitOnboardingData(cleanedFormData);
      if (res.success) {
        onComplete();
      }
    } catch (error) {
      console.error('Submit Failed', error);
      alert('حدث خطأ أثناء معالجة الصور أو حفظ البيانات، يرجى المحاولة مرة أخرى');
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
  };
};
