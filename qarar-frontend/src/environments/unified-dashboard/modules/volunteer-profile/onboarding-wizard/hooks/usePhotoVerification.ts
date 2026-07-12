// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/hooks/usePhotoVerification.ts

import { useState } from 'react';

interface UsePhotoVerificationProps {
  initialPhotoUrl: string | null;
  updateFields: (fields: Partial<any>) => void;
}

// 🛠️ المكبس الرقمي: دالة قياسية لضغط وتقليص حجم الصورة برمجياً في جهاز المستخدم
const compressImage = (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // الحفاظ على أبعاد ونسب الصورة الأصلية بدون تشويه الملامح
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
        ctx?.drawImage(img, 0, 0, width, height);

        // تحويل الصورة الناتجة إلى نص Base64 مضغوط وخفيف الوزن جداً
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const usePhotoVerification = ({ initialPhotoUrl, updateFields }: UsePhotoVerificationProps) => {
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // حافظنا على الحقل ده عشان ما نضرب كود صفحة StepPhotoSecure القديم
  const isModelLoading = false; 

  // دالة قراءة الصورة الفورية (تم تفعيل الضغط الذكي جواها)
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التأكد من أن الملف المختار هو صورة فعلاً لحماية النظام
    if (!file.type.startsWith('image/')) {
      setErrorMessage('عذراً، يرجى اختيار ملف صورة صالح.');
      return;
    }

    try {
      setIsValidating(true); // تشغيل مؤشر الانتظار اللطيف أثناء الضغط
      setErrorMessage(null);

      // ⚡ ضغط الصورة فوراً في جهاز المستخدم (تستغرق أجزاء من الثانية)
      const compressedBase64 = await compressImage(file);
      
      // تحديث المعاينة والبيانات بالنص الخفيف الجديد
      setPreview(compressedBase64);
      updateFields({ profileImageUrl: compressedBase64, photo_url: compressedBase64 });
    } catch (error) {
      console.error('Image compression failed:', error);
      setErrorMessage('حدث خطأ أثناء معالجة وحفظ الصورة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsValidating(false); // إيقاف مؤشر الانتظار
    }
  };

  // دالة مسح الصورة وتصفيرها
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
