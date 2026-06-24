import axios from 'axios';

// هنا الكود بيقرأ تلقائياً الرابط اللي أنت حطيته في الـ Render فوق
const HASR_API_BASE_URL = process.env.HASR_API_URL;

export const hasrApiClient = {
  /**
   * دالة لجلب بيانات المتطوع من نظام الحصر باستخدام رقمه حياً
   */
  async getVolunteerById(volunteerId: string) {
    try {
      // الاتصال بالمسار النهائي الصحيح بعد دمج البادئات المكتشفة (/api/volunteers)
      const response = await axios.get(`${HASR_API_BASE_URL}/api/volunteers/public/${encodeURIComponent(volunteerId)}`);
      return response.data; 
    } catch (error: any) {
      // لو نظام الحصر قال 404 يعني الرقم غير موجود في قاعدة البيانات
      if (error.response && error.response.status === 404) {
        throw new Error('عفواً، هذا الرقم غير مسجل في نظام الحصر الرسمي');
      }
      // أي خطأ آخر مثل السيرفر واقف أو مشكلة شبكة
      throw new Error('فشل الاتصال بنظام الحصر، الرجاء المحاولة لاحقاً');
    }
  }
};
