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

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

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

  // الدالة النهائية بعد تزويدها بكاشف الأعطال الدقيق
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalPhotoUrl = '';
      let finalSecurePhotoUrl = '';

      // 1. مرحلة رفع الصورة لكلاودنري
      if (formData.photo_url) {
        try {
          const uploadedOriginalUrl = await uploadToCloudinary(formData.photo_url);

          if (formData.is_niqabi) {
            finalSecurePhotoUrl = uploadedOriginalUrl;
            finalPhotoUrl = uploadedOriginalUrl.replace('/upload/', '/upload/e_blur:2000,f_auto,q_auto/');
          } else {
            finalPhotoUrl = uploadedOriginalUrl;
            finalSecurePhotoUrl = ''; 
          }
        } catch (cloudinaryError: any) {
          alert(`❌ [مشكلة في كلاودنري]: ${cloudinaryError.message}`);
          throw cloudinaryError; // إيقاف العملية هنا لأن الصورة لم ترفع
        }
      }

      // تجهيز كائن البيانات النهائي
      const cleanedFormData: OnboardingFormData = {
        ...formData,
        photo_url: finalPhotoUrl,
        secure_photo_url: finalSecurePhotoUrl,
      };

      // 2. مرحلة الحفظ في سيرفر قاعدة البيانات (Backend)
      try {
        const res = await submitOnboardingData(cleanedFormData);
        if (res.success) {
          onComplete();
        } else {
          alert('❌ [رفض من السيرفر]: السيرفر استلم البيانات لكن رفض الحفظ. تأكد من إدخال جميع الحقول الإلزامية.');
        }
      } catch (apiError: any) {
        alert(`❌ [فشل اتصال السيرفر Backend]: تعذر إرسال البيانات لقاعدة البيانات. قد يكون سيرفر Render نائماً أو متوقفاً.`);
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
  };
};
