// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/hooks/usePhotoVerification.ts

import { useState } from 'react';
import imageCompression from 'browser-image-compression'; 

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

    if (!file.type.startsWith('image/')) {
      setErrorMessage('عذراً، يرجى اختيار ملف صورة صالح.');
      return;
    }

    // إعدادات الضغط فائقة التوافقية لتناسب متصفحات التواصل الاجتماعي وسيرفر Vercel
    const options = {
      maxSizeMB: 0.4,          // حجم مثالي جداً (في حدود 400 كيلوبايت)
      maxWidthOrHeight: 1200,  // أبعاد حادة وممتازة للبطاقات والشهادات
      useWebWorker: false,     // ❌ تعطيله هنا هو السر ليشتغل الكود جوة (واتساب/فيسبوك/سافاري) بدون قيود أمان
    };

    try {
      setIsValidating(true); 
      setErrorMessage(null);

      // ⚡ تشغيل المكبس الاحترافي المضمون
      const compressedFile = await imageCompression(file, options);
      
      // تحويل الملف المضغوط إلى رابط معاينة نصي
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
