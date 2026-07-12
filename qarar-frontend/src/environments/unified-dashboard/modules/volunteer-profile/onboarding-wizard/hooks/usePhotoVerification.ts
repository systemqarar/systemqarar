// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/hooks/usePhotoVerification.ts

import { useState } from 'react';

interface UsePhotoVerificationProps {
  initialPhotoUrl: string | null;
  updateFields: (fields: Partial<any>) => void;
}

// 🛡️ المكبس الرقمي المدرع: مصمم للتعامل مع صور الكاميرا فائقة الدقة بأمان تام وبدون استهلاك للـ RAM
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.70): Promise<string> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;

    img.onload = async () => {
      try {
        // ⚡ ميزة هندسية: فك تشفير الصورة في الخلفية تمنع تهنيج أو توقف متصفح الموبايل
        if ('decode' in img) {
          await img.decode();
        }

        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // حساب الأبعاد الجديدة بدقة مع الحفاظ على النسب الأصلية
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('تعذر تشغيل سياق الرسم الثنائي (Canvas Context)');
        }

        // الرسم بأعلى جودة تنعيم ممكنة
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        // تحويل خفيف الوزن لصيغة JPEG وضغط ذكي
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // 🧹 تنظيف فوري للذاكرة
        URL.revokeObjectURL(objectUrl);
        resolve(compressedBase64);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
};

export const usePhotoVerification = ({ initialPhotoUrl, updateFields }: UsePhotoVerificationProps) => {
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const isModelLoading = false; 

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('عذراً، يرجى اختيار ملف صورة صالح.');
      return;
    }

    try {
      setIsValidating(true); 
      setErrorMessage(null);

      // تشغيل المكبس المدرع
      const compressedBase64 = await compressImage(file);
      
      setPreview(compressedBase64);
      updateFields({ profileImageUrl: compressedBase64, photo_url: compressedBase64 });
    } catch (error: any) {
      // طباعة تفاصيل الخطأ في الكونسول للمهندس والمشرف لمتابعة الأداء
      console.error('🚨 [خطأ معالجة الصورة]:', error);
      setErrorMessage(`تعذر تجهيز الصورة بسبب قيود الذاكرة في الهاتف. يرجى محاولة التقاطها بدقة أقل أو اختيار صورة أخرى.`);
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
