// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/hooks/usePhotoVerification.ts

import { useState } from 'react';

interface UsePhotoVerificationProps {
  initialPhotoUrl: string | null;
  updateFields: (fields: Partial<any>) => void;
}

// 🚀 المكبس الرقمي المعتمد على المعالج: يفك الصورة على مستوى العتاد لمنع أخطاء الذاكرة نهائياً
const compressImageHardware = async (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> => {
  // ⚡ فك التشفير المباشر والسريع عبر كرت الشاشة بدون استخدام عناصر الـ DOM
  const bitmap = await createImageBitmap(file);
  
  const canvas = document.createElement('canvas');
  let width = bitmap.width;
  let height = bitmap.height;

  // الحفاظ على أبعاد ونسب الصورة الأصلية بدقة تامة
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
    bitmap.close();
    throw new Error('تعذر تشغيل سياق الرسم في المتصفح');
  }

  // رسم البيتماب على الكانفاس بسرعة فائقة
  ctx.drawImage(bitmap, 0, 0, width, height);
  
  // تحويل النتيجة المكبوسة بنجاح إلى Base64 خفيف
  const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
  
  // 🧹 إغلاق البيتماب فوراً لتحرير ذاكرة الجهاز كلياً
  bitmap.close();
  
  return compressedBase64;
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

      // تشغيل معالجة العتاد القوية
      const compressedBase64 = await compressImageHardware(file);
      
      setPreview(compressedBase64);
      updateFields({ profileImageUrl: compressedBase64, photo_url: compressedBase64 });
    } catch (error: any) {
      console.error('🚨 [Hardware Compression Error]:', error);
      const errorText = error?.message || 'المتصفح رفض معالجة حجم الصورة الحالي.';
      setErrorMessage(`❌ [مشكلة في محرك الموبايل]: ${errorText} .. يرجى تجربة التقاط الصورة مجدداً أو اختيار صورة أخرى.`);
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
