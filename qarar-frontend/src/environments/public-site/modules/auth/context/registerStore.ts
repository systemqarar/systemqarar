import { create } from 'zustand';

interface RegisterState {
  step: number;
  volunteerId: string;
  snapshot: any;
  maskedWhatsapp: string;
  setStep: (step: number) => void;
  setVolunteerId: (id: string) => void;
  setSnapshot: (snapshot: any) => void;
  setMaskedWhatsapp: (whatsapp: string) => void;
  resetStore: () => void;
}

export const useRegisterStore = create<RegisterState>((set) => ({
  step: 1,
  volunteerId: '',
  snapshot: null,
  maskedWhatsapp: '',
  setStep: (step) => set({ step }),
  setVolunteerId: (volunteerId) => set({ volunteerId }),
  setSnapshot: (snapshot) => set({ snapshot }),
  setMaskedWhatsapp: (maskedWhatsapp) => set({ maskedWhatsapp }),
  resetStore: () => set({ step: 1, volunteerId: '', snapshot: null, maskedWhatsapp: '' }),
}));

export default useRegisterStore;
