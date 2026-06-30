// unified-dashboard/modules/volunteer-profile/onboarding-wizard/hooks/usePhotoVerification.ts

import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

interface UsePhotoVerificationProps {
  initialPhotoUrl: string | null;
  updateFields: (fields: Partial<any>) => void;
}

export const usePhotoVerification = ({ initialPhotoUrl, updateFields }: UsePhotoVerificationProps) => {
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // تحميل موديلات الذكاء الاصطناعي
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/cstefanache/face-api.js-models@master/weights/';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setIsModelLoading(false);
      } catch (err) {
        console.error("فشل تحميل موديلات فحص الوجه:", err);
        setIsModelLoading(false); // نمرر المستخدم حتى لو الـ CDN علق
      }
    };
    loadModels();
  }, []);

  // دالة المعالجة والفحص (هنا "مخ" العملية)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsValidating(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;

      const img = new Image();
      img.src = base64Image;
      img.onload = async () => {
        try {
          // أمان: لو الموديل ما تحمل لسبب ما، نتخطى الفحص
          if (!faceapi.nets.tinyFaceDetector.params) {
            setPreview(base64Image);
            updateFields({ photo_url: base64Image });
            setIsValidating(false);
            return;
          }

          // تصغير الصورة لسرعة الفحص
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0, width, height);

          // تشغيل فحص الوجه الحالي
          const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());

          if (detections.length === 0) {
            setErrorMessage('❌ عذراً، لم يتم العثور على وجه واضح. يرجى رفع صورة شخصية رسمية تظهر فيها ملامح الوجه كاملة.');
            setIsValidating(false);
            return;
          }

          if (detections.length > 1) {
            setErrorMessage('❌ عذراً، تم العثور على أكثر من شخص في الصورة. يرجى رفع صورة شخصية خاصة بك فقط.');
            setIsValidating(false);
            return;
          }

          // نجاح الفحص
          setPreview(base64Image);
          updateFields({ photo_url: base64Image });
          setErrorMessage(null);
        } catch (err) {
          console.error("خطأ أثناء فحص الصورة:", err);
          setPreview(base64Image);
          updateFields({ photo_url: base64Image });
        } finally {
          setIsValidating(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // دالة مسح الصورة وتصفيرها
  const clearPhoto = () => {
    setPreview(null);
    updateFields({ photo_url: '' });
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
