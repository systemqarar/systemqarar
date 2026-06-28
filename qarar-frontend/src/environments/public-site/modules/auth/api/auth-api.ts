import apiClient from '../../../../../api/api-client';

export const authApi = {
  // 1️⃣ تسجيل الدخول الروتيني
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  // 2️⃣ فحص المعرف في نظام الحصر
  verifyVolunteer: async (volunteerNumber: string) => {
    const response = await apiClient.post('/auth/verify-volunteer', { volunteer_number: volunteerNumber });
    return response.data;
  },

  // 3️⃣ مطابقة رمز الـ OTP
  verifyOTP: async (volunteerNumber: string, otpCode: string) => {
    const response = await apiClient.post('/auth/verify-otp', { volunteer_number: volunteerNumber, otp_code: otpCode });
    return response.data;
  },

  // 4️⃣ مسار الطوارئ والطلب اليدوي
  emergencyRequest: async (volunteerNumber: string) => {
    const response = await apiClient.post('/auth/emergency-request', { volunteer_number: volunteerNumber });
    return response.data;
  },

  // 5️⃣ إنشاء الحساب النهائي وحفظ اللقطة
  register: async (payload: any) => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  }
};

export default authApi;
