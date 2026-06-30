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

  // 1. تحميل موديلات الذكاء الاصطناعي
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/cstefanache/face-api.js-models@master/weights/';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setIsModelLoading(false);
      } catch (err) {
        console.error("فشل تحميل موديلات فحص الوجه:", err);
        setIsModelLoading(false);
      }
    };
    loadModels();
  }, []);

  // 2. دالة المعالجة والفحص مع حماية التايم آوت
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsValidating(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      const img = new Image();
      
      // ⏱️ سياج الأمان الزمني (Timeout): لو الفحص علق أكتر من 4 ثواني، مرر الصورة طوالي
      const validationTimeout = setTimeout(() => {
        console.warn("⏱️ استغرق الفحص وقتاً طويلاً، تم تخطي التدقيق لتجنب تعليق المستخدم.");
        setPreview(base64Image);
        updateFields({ photo_url: base64Image });
        setIsValidating(false);
      }, 4000);

      // 🛑 حماية في حال فشل قراءة الصورة تماماً
      img.onerror = () => {
        clearTimeout(validationTimeout);
        setErrorMessage('❌ حدث خطأ أثناء قراءة ملف الصورة. يرجى تجربة صورة أخرى.');
        setIsValidating(false);
      };

      img.onload = async () => {
        try {
          if (!faceapi.nets.tinyFaceDetector.params) {
            clearTimeout(validationTimeout);
            setPreview(base64Image);
            updateFields({ photo_url: base64Image });
            setIsValidating(false);
            return;
          }

          // تصغير الصورة للسرعة الفائقة
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

          // تشغيل الفحص
          const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());

          // إلغاء التايم آوت لأن الفحص جاب نتيجة
          clearTimeout(validationTimeout);

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

          // نجاح الفحص بنسبة 100%
          setPreview(base64Image);
          updateFields({ photo_url: base64Image });
          setErrorMessage(null);
        } catch (err) {
          console.error("خطأ أثناء فحص الصورة:", err);
          clearTimeout(validationTimeout);
          setPreview(base64Image);
          updateFields({ photo_url: base64Image });
        } finally {
          setIsValidating(false);
        }
      };
      
      img.src = base64Image;
    };
    reader.readAsDataURL(file);
  };

  // 3. دالة تصفير الصورة
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
