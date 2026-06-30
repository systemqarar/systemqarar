import axios from 'axios';
import { OnboardingFormData } from '../types/onboarding.types';

export const submitOnboardingData = async (data: OnboardingFormData): Promise<{ success: boolean }> => {
  const fullAddress = `المنطقة: ${data.main_address} - تفاصيل: ${data.detailed_address}`;
  
  const payload = {
    gender: data.gender,
    date_of_birth: data.date_of_birth,
    marital_status: data.marital_status,
    blood_type: data.blood_type,
    email: data.email,
    education_level: data.education_level,
    job_title: data.job_title,
    detailed_address: fullAddress,
    desired_department: data.desired_department,
    is_niqabi: data.is_niqabi,
    photo_url: data.photo_url,
    secure_photo_url: data.secure_photo_url,
    is_profile_completed: true
  };

  // الإرسال للرابط الداخلي، وفرسيل ح يتكفل بتمريره فوراً لسيرفر ريندر
  const response = await axios.post('/api/volunteer/profile/onboarding/complete', payload);
  return response.data;
};
