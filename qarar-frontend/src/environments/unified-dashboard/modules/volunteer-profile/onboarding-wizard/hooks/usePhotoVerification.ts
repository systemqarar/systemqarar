// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/hooks/usePhotoVerification.ts

import { useState } from 'react';

interface UsePhotoVerificationProps {
  initialPhotoUrl: string | null;
  updateFields: (fields: Partial<any>) => void;
}

export const usePhotoVerification = ({ initialPhotoUrl, updateFields }: UsePhotoVerificationProps) => {
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl);
  
  // حافَظنا على الحقول دي عشان ما نضرب كود صفحة StepPhotoSecure القديم
  const isModelLoading = false; 
  const isValidating = false;
  const errorMessage = null;

  // دالة قراءة الصورة الفورية (خفيفة وسريعة وبدون أي تعليق)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setPreview(base64Image);
      
      // تحديث البيانات فوراً بالصورة الممسوحة ضوئياً
      updateFields({ profileImageUrl: base64Image, photo_url: base64Image });
    };
    reader.readAsDataURL(file);
  };

  // دالة مسح الصورة وتصفيرها
  const clearPhoto = () => {
    setPreview(null);
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
