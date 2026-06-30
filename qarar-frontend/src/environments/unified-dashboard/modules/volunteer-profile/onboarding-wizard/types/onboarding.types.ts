export interface OnboardingFormData {
  gender: 'ذكر' | 'أنثى' | '';
  date_of_birth: string;
  marital_status: string;
  blood_type: string;
  email: string;
  education_level: string;
  job_title: string;
  main_address: string; // المنطقة المختارة من القائمة
  detailed_address: string; // المربع والحي والمعلم البارز
  desired_department: string;
  is_niqabi: boolean;
  photo_url: string;
  secure_photo_url: string;
}

export interface WizardStepProps {
  formData: OnboardingFormData;
  updateFields: (fields: Partial<OnboardingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}
