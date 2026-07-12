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

    const options = {
      maxSizeMB: 0.4,          
      maxWidthOrHeight: 1200,  
      useWebWorker: false,     // مغلق لضمان التوافقية مع كل المتصفحات الداخلية
    };

    try {
      setIsValidating(true); 
      setErrorMessage(null);

      // تشغيل مكتبة الضغط
      const compressedFile = await imageCompression(file, options);
      
      // تحويل الملف المضغوط إلى رابط معاينة
      const base64Image = await imageCompression.getDataUrlFromFile(compressedFile);
      
      setPreview(base64Image);
      updateFields({ profileImageUrl: base64Image, photo_url: base64Image });
    } catch (error: any) {
      console.error('🚨 [خطأ نظام الضغط الاحترافي]:', error);
      
      // 🛠️ استخراج نص الخطأ الحقيقي القادم من نظام التشغيل أو المكتبة وعرضه للمعاينة
      const realReason = error?.message || (typeof error === 'string' ? error : JSON.stringify(error)) || 'خطأ غير معروف';
      
      setErrorMessage(`❌ [خطأ المحرك الحقيقي]: ${realReason}`);
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
