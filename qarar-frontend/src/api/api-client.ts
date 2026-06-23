import axios from 'axios';

// إنشاء عميل الاتصال المركزي مع السيرفر
const apiClient = axios.create({
// تحديث السطر داخل قارار فرونتد ليقبل الرابط الحي مستقبلاً
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// لاعبي خط الوسط (Interceptors): حقن توكن الـ JWT تلقائياً في أي طلب إذا كان المستخدم مسجل دخول
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qarar_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// معالجة الأخطاء القادمة من السيرفر بشكل موحد (مثل انتهاء صلاحية التوكن)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ جلسة المستخدم انتهت أو التوكن غير صالح، يتم التوجيه للموقع العام');
      localStorage.removeItem('qarar_token');
      localStorage.removeItem('qarar_user');
      // يمكن إضافة تفعيل توجيه نافذة المتصفح هنا إذا استدعى الأمر
    }
    return Promise.reject(error);
  }
);

export default apiClient;
