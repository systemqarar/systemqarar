// src/api/cloudinaryService.ts

/**
 * دالة رئيسية وموحدة لرفع الصور مباشرة إلى كلاودنري من الفرونت إند
 * @param base64String الصورة ممررة كـ نص أو رابط
 * @returns رابط الصورة الآمن المستضاف على كلاودنري
 */
export const uploadToCloudinary = async (base64String: string): Promise<string> => {
  // لو الصورة أصلاً مرفوعة وجاهزة عبارة عن رابط، نرجعها طوالي بدون معالجة
  if (!base64String || base64String.startsWith('http')) {
    return base64String;
  }

  const env = (import.meta as any).env || {};
  const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET; 

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('المتغيرات VITE_CLOUDINARY_CLOUD_NAME أو VITE_CLOUDINARY_UPLOAD_PRESET غير معرفة في السيرفر');
  }

  const formData = new FormData();
  formData.append('file', base64String);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`كلاودنري رفض الرفع: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url; 
};
