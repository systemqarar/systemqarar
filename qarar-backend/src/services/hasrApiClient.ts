import axios from 'axios';

// قراءة الرابط من متغيرات البيئة في Render
const HASR_API_BASE_URL = process.env.HASR_API_URL;

export const hasrApiClient = {
  /**
   * دالة لجلب بيانات المتطوع من نظام الحصر باستخدام رقمه حياً
   */
  async getVolunteerById(volunteerId: string) {
    try {
      // طباعة الرابط للتأكد من صحته في الـ Logs عند استدعاء الدالة
      console.log(`📡 محاولة الاتصال بنظام الحصر عبر الرابط: ${HASR_API_BASE_URL}/api/volunteers/public/${encodeURIComponent(volunteerId)}`);

      const response = await axios.get(`${HASR_API_BASE_URL}/api/volunteers/public/${encodeURIComponent(volunteerId)}`);
      return response.data; 
    } catch (error: any) {

      // 🎯 [سطور الكشف الذكي]: طباعة تفاصيل المشكلة الحقيقية في لوحة Render
      if (error.response) {
        console.error('❌ نظام الحصر الخارجي استجاب بخطأ:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('❌ فشل كامل في الوصول لنظام الحصر (لا يوجد استجابة، السيرفر غالباً ميت أو الرابط خطأ):', error.message);
      } else {
        console.error('❌ خطأ في إعدادات طلب الـ API:', error.message);
      }

      // لو نظام الحصر قال 404 يعني الرقم غير موجود في قاعدة البيانات
      if (error.response && error.response.status === 404) {
        throw new Error('عفواً، هذا الرقم غير مسجل في نظام الحصر الرسمي');
      }
      // أي خطأ آخر مثل السيرفر واقف أو مشكلة شبكة
      throw new Error(`فشل الاتصال بنظام الحصر: (${error.message})`);
    }
  }
};