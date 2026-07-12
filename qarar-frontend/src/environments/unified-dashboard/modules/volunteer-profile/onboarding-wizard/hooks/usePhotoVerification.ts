// src/modules/unified-dashboard/volunteer-profile/onboarding-wizard/hooks/usePhotoVerification.ts

import { useState } from 'react';

interface UsePhotoVerificationProps {
  initialPhotoUrl: string | null;
  updateFields: (fields: Partial<any>) => void;
}

// الإستراتيجية الأولى: الضغط السريع عبر الـ Bitmap
const tryBitmapCompression = async (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  let width = bitmap.width;
  let height = bitmap.height;

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
    throw new Error('Canvas Context Unavailable');
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  const base64 = canvas.toDataURL('image/jpeg', quality);
  bitmap.close();
  return base64;
};

// الإستراتيجية الثانية (الخطة البديلة): الضغط التقليدي الآمن عبر تدفق البيانات
const tryDOMCompression = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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
        if (!ctx) return reject(new Error('Canvas Context Unavailable'));

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('DOM Image Decode Failed'));
    };
    reader.onerror = () => reject(new Error('File Reader Failed'));
    reader.readAsDataURL(file);
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

      let finalBase64 = '';

      try {
        finalBase64 = await tryBitmapCompression(file);
      } catch (bitmapError) {
        console.warn('⚠️ فشل نظام البيتماب، التحول التلقائي للخطة البديلة...', bitmapError);
        finalBase64 = await tryDOMCompression(file);
      }
      
      setPreview(finalBase64);
      updateFields({ profileImageUrl: finalBase64, photo_url: finalBase64 });
    } catch (error: any) {
      console.error('🚨 [نظام قرار - عجز المتصفح عن فك التشفير]:', error);
      
      // 📝 النص الجديد: بسيط، واضح، ويوجه المستخدم بالبلدي وبدون مصطلحات تخوفه
      setErrorMessage(
        'عذراً، الصورة التي ارفقتها جودتها عالية جدا وتعذر معالجتها .. يمكنك اختيار صورة اخرى من المعرض، وفي حال كنت تفضل هذه الصورة فيمكنك الدخول للمعرض وعمل لقطة الشاشة لهذه الصورة ومن ثم اعادة ارفاق الصورة الجديدة'
      );
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
