// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/hooks/usePhotoVerification.ts

import { useState } from 'react';
import imageCompression from 'browser-image-compression'; // 🚀 استدعاء مكتبة الضغط الاحترافية العالمية

interface UsePhotoVerificationProps {
  initialPhotoUrl: string | null;
  updateFields: (fields: Partial<any>) => void;
}

export const usePhotoVerification = ({ initialPhotoUrl, updateFields }: UsePhotoVerificationProps) => {
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const isModelLoading = false; 

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التأكد من أن الملف المختار هو صورة فعلاً لحماية النظام
    if (!file.type.startsWith('image/')) {
      setErrorMessage('عذراً، يرجى اختيار ملف صورة صالح.');
      return;
    }

    // إعدادات الضغط الاحترافية والموزونة بدقة لـ قرار
    const options = {
      maxSizeMB: 0.3,          // الحجم الأقصى الناتج يكون في حدود 300 كيلوبايت فقط (خفيف وسريع جداً في الرفع)
      maxWidthOrHeight: 1200,  // أبعاد ممتازة وحادة جداً للبطاقات والشهادات الرسمية
      useWebWorker: true,      // تشغيل الضغط في الخلفية لحماية ذاكرة الموبايل ومنع الانهيار
    };

    try {
      setIsValidating(true); 
      setErrorMessage(null);

      // ⚡ تشغيل المعالجة الاحترافية (تتعامل مع أي حجم صورة كاميرا بسلاسة تامة)
      const compressedFile = await imageCompression(file, options);
      
      // تحويل الملف المضغوط الخفيف إلى نص لمعاينته وحفظه
      const base64Image = await imageCompression.getDataUrlFromFile(compressedFile);
      
      setPreview(base64Image);
      updateFields({ profileImageUrl: base64Image, photo_url: base64Image });
    } catch (error) {
      console.error('🚨 [خطأ نظام الضغط الاحترافي]:', error);
      setErrorMessage('تعذر معالجة الصورة الشخصية. يرجى إعادة المحاولة أو اختيار صورة أخرى.');
    } finally {
      setIsValidating(false); 
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    setErrorMessage(null);
    updateFields({ profileImageUrl: '', photo_url: '' });
  };

  return {
    preview,
    isModelLoading,
    isValidating,
    errorMessage,
    handlePhotoChange,
    clearPhoto,
  };
};
