import { create } from 'zustand';

// 1. تحديث الواجهة لتعريف الخصائص الجديدة
interface RegisterState {
  step: number;
  volunteerNumber: string; // تم التعديل
  snapshot: any;
  maskedWhatsapp: string;
  setStep: (step: number) => void;
  setVolunteerNumber: (num: string) => void; // تم التعديل
  setSnapshot: (snapshot: any) => void;
  setMaskedWhatsapp: (whatsapp: string) => void;
  resetStore: () => void;
}

// 2. تحديث المخزن ليطابق الواجهة الجديدة
export const useRegisterStore = create<RegisterState>((set) => ({
  step: 1,
  volunteerNumber: '', // تم التعديل
  snapshot: null,
  maskedWhatsapp: '',
  setStep: (step) => set({ step }),
  setVolunteerNumber: (volunteerNumber) => set({ volunteerNumber }), // تم التعديل
  setSnapshot: (snapshot) => set({ snapshot }),
  setMaskedWhatsapp: (maskedWhatsapp) => set({ maskedWhatsapp }),
  resetStore: () => set({ 
    step: 1, 
    volunteerNumber: '', // تم التعديل
    snapshot: null, 
    maskedWhatsapp: '' 
  }),
}));

export default useRegisterStore;
