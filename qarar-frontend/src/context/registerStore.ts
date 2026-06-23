import { create } from 'zustand';
import { IRegisterStore } from '../types/auth.types';

// إنشاء المخزن الرقمي لخطوات التسجيل الأربعة باستخدام Zustand
export const useRegisterStore = create<IRegisterStore>((set) => ({
  step: 1, // البداية دائماً من الشاشة 1 (تسجيل الدخول الروتيني)
  volunteerId: '',
  snapshot: null,
  maskedWhatsapp: '',

  // تحديث الخطوة الحالية (الانتقال بين الشاشات)
  setStep: (step) => set({ step }),

  // حفظ المعرف المكتوب في الشاشة 2
  setVolunteerId: (volunteerId) => set({ volunteerId }),

  // حفظ لقطة البيانات المسحوبة من الحصر لعرضها بالشاشة 4
  setSnapshot: (snapshot) => set({ snapshot }),

  // حفظ رقم الواتساب المقنع لإظهاره في شاشة الـ OTP (الشاشة 3)
  setMaskedWhatsapp: (maskedWhatsapp) => set({ maskedWhatsapp }),

  // تصفير المخزن بالكامل عند اكتمال العملية أو العودة
  resetStore: () => set({ step: 1, volunteerId: '', snapshot: null, maskedWhatsapp: '' }),
}));
