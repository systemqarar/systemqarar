import axios from 'axios';
import { OnboardingFormData } from '../types/onboarding.types';

export const submitOnboardingData = async (data: OnboardingFormData): Promise<{ success: boolean }> => {
  
  let userId = localStorage.getItem('userId');
  
  // 🕵️‍♂️ محرك بحث ذكي: إذا لم نجد الـ userId مباشر، نلف على كل محتويات الذاكرة ونحللها
  if (!userId) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          // 1. لو كان المفتاح نفسه يحتوي على كلمة id أو user
          if (key.toLowerCase().includes('userid') || key.toLowerCase() === 'id' || key.toLowerCase().includes('volunteer')) {
            // للتأكد أنه ليس نصاً طويلاً جداً كالتوكن
            if (value.length < 50 && !value.startsWith('{')) {
              userId = value;
              break;
            }
          }
          // 2. لو كانت القيمة كائن JSON، نفتش جواه عن أي حقل يمثل الـ id
          if (value.startsWith('{')) {
            try {
              const parsed = JSON.parse(value);
              userId = parsed.id || parsed.userId || parsed._id || parsed.user_id || 
                       parsed.data?.id || parsed.data?.userId || parsed.data?.user_id ||
                       parsed.volunteer?.id || parsed.volunteer?.user_id || parsed.user?.id || parsed.user?.userId;
              if (userId) break;
            } catch (e) {
              // تجاوز الأخطاء إذا لم يكن JSON سليم
            }
          }
        }
      }
    }
  }

  // 🚨 خطة الطوارئ الكاشفة: لو لسه ما لقى الـ id، حيطبع ليك كل الكلمات المفتاحية الموجودة في ذاكرتك هسي!
  if (!userId) {
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i));
    }
    throw new Error(`معرّف المستخدم غير موجود. المفاتيح المتوفرة في جهازك حالياً هي: [${allKeys.join(', ')}]. يرجى تصوير الشاشة وإرسالها لي.`);
  }

  const fullAddress = `المنطقة: ${data.main_address} - تفاصيل: ${data.detailed_address}`;
  
  const payload = {
    userId, // تم العثور عليه واصطياده بنجاح!
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

  const response = await axios.post('/api/volunteer/profile/update', payload);
  return response.data;
};
