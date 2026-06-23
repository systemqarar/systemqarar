import axios from 'axios';

// إنشاء عميل الاتصال الرئيسي مع الباكيند بشكل ديناميكي يقبل التطوير والإنتاج الحي
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// اعتراض الطلبات لتمرير رمز الأمان (JWT Token) تلقائياً في الهيدر إذا كان المتطوع مسجلاً
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

export default apiClient;
