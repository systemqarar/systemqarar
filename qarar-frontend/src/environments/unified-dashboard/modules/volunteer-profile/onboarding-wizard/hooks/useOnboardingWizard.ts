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
  // إذا كان الحقل فارغاً أو يحتوي على رابط مسبقاً (http)، نرجعه كما هو بدون إعادة رفع
  if (!base64String || base64String.startsWith('http')) {
    return base64String;
  }

  // ⚠️ !!! ضع هنا بيانات حسابك الخاص في كلاودنري !!! ⚠️
  const CLOUD_NAME = "oeakvcbg"; 
  const UPLOAD_PRESET = "systemqarar"; 

  const formData = new FormData();
  formData.append('file', base64String);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
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
      // تصفير خيار النقاب تلقائياً لو تم تغيير الجنس إلى ذكر
      if (fields.gender === 'ذكر') {
        updated.is_niqabi = false;
      }
      return updated;
    });
  };

  const nextStep = () => setCurrentStep((i) => i + 1);
  const prevStep = () => setCurrentStep((i) => i - 1);

  // الدالة النهائية بعد التعديل الهيكلي والأمني الاحترافي
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalPhotoUrl = '';
      let finalSecurePhotoUrl = '';

      // إذا قام المتطوع برفع صورة في خطوة الـ Onboarding
      if (formData.photo_url) {
        // 1. رفع الصورة الأصلية الواضحة والحصول على رابطها من كلاودنري
        const uploadedOriginalUrl = await uploadToCloudinary(formData.photo_url);

        // 2. التحقق من خيار الخصوصية للمنقبات
        if (formData.is_niqabi) {
          // أ) الصورة الأصلية الواضحة تذهب لحقل الأمان الإداري (للاستخدام في الشهادات لاحقاً)
          finalSecurePhotoUrl = uploadedOriginalUrl;

          // ب) الصورة العامة يتم تغبيشها بالكامل عبر سحاب كلاودنري وتحفظ في photo_url (للبطاقات والموقع العام)
          finalPhotoUrl = uploadedOriginalUrl.replace('/upload/', '/upload/e_blur:2000,f_auto,q_auto/');
        } else {
          // للمتطوع العادي: الصورة العامة هي الصورة الأصلية الواضحة
          finalPhotoUrl = uploadedOriginalUrl;
          finalSecurePhotoUrl = ''; // يظل حقل الأمان فارغاً في قاعدة البيانات
        }
      }

      // تجهيز كائن البيانات النهائي النظيف والآمن (روابط نصوص خفيفة بدلاً من الـ Base64 الضخم)
      const cleanedFormData: OnboardingFormData = {
        ...formData,
        photo_url: finalPhotoUrl,
        secure_photo_url: finalSecurePhotoUrl,
      };

      // إرسال الطلب الذكي والسريع إلى السيرفر الخاص بك (Render / Vercel)
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
