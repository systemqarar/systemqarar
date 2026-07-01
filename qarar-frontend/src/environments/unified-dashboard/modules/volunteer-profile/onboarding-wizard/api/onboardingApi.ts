import axios from 'axios';
import { OnboardingFormData } from '../types/onboarding.types';

export const submitOnboardingData = async (data: OnboardingFormData): Promise<{ success: boolean }> => {
  
  let userId = localStorage.getItem('userId');
  
  // 🕵️‍♂️ محرك البحث الذكي عن الـ userId (كما هو بدون تعديل)
  if (!userId) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          if (key.toLowerCase().includes('userid') || key.toLowerCase() === 'id' || key.toLowerCase().includes('volunteer')) {
            if (value.length < 50 && !value.startsWith('{')) {
              userId = value;
              break;
            }
          }
          if (value.startsWith('{')) {
            try {
              const parsed = JSON.parse(value);
              userId = parsed.id || parsed.userId || parsed._id || parsed.user_id || 
                       parsed.data?.id || parsed.data?.userId || parsed.data?.user_id ||
                       parsed.volunteer?.id || parsed.volunteer?.user_id || parsed.user?.id || parsed.user?.userId;
              if (userId) break;
            } catch (e) {}
          }
        }
      }
    }
  }

  if (!userId) {
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i));
    }
    throw new Error(`معرّف المستخدم غير موجود. المفاتيح المتوفرة: [${allKeys.join(', ')}]`);
  }

  const fullAddress = `المنطقة: ${data.main_address} - تفاصيل: ${data.detailed_address}`;
  
  // 🎯 المطابقة الكاملة مع الـ PersonalDataController في السيرفر
  const payload = {
    userId,
    gender: data.gender,
    birthDate: data.date_of_birth,         
    bloodType: data.blood_type,           
    maritalStatus: data.marital_status,     
    email: data.email,
    education: data.education_level,       
    occupation: data.job_title,            
    address: fullAddress,                  
    preferredOffice: data.desired_department, 
    isNiqabi: data.is_niqabi,              
    
    // نرسل رابط الصورة النقي القادم من Cloudinary والسيرفر سيتكفل بالفصل والتشويش
    profileImageUrl: data.photo_url || data.secure_photo_url 
  };

  const response = await axios.post('/api/volunteer/profile/update', payload);
  return response.data;
};
