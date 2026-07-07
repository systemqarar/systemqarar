import { useState, useEffect } from 'react';
import { RenderStatus, RenderLog } from '../types/render.types';

export const useRenderStatus = () => {
  const [status, setStatus] = useState<RenderStatus | null>(null);
  const [logs, setLogs] = useState<RenderLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeploying, setIsDeploying] = useState<boolean>(false); // 🚀 حالة مضافة لمنع الضغط المتكرر أثناء التحديث

  const fetchMetrics = async () => {
    try {
      // القراءة المباشرة من متغيرات البيئة المحقونة داخل سيرفر فيرسال
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      if (!baseUrl) {
        console.warn('⚠️ تنبيه للمطور: لم يتم العثور على المتغير VITE_API_BASE_URL في إعدادات فيرسال بعد.');
      }
      
      const token = localStorage.getItem('token'); 

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // تمرير التوكن للحارس المقفل في الباكيند
      };

      const [statusRes, logsRes] = await Promise.all([
        fetch(`${baseUrl}/api/developer-zone/monitoring/render/status`, { headers }),
        fetch(`${baseUrl}/api/developer-zone/monitoring/render/logs`, { headers })
      ]);

      const statusData = await statusRes.json();
      const logsData = await logsRes.json();

      if (statusData.success) setStatus(statusData.data);
      if (logsData.success) setLogs(logsData.data);
    } catch (error) {
      console.error('Error fetching Render metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 ميزة التحكم المضافة: إرسال أمر النشر والتحديث الفوري للسيرفر
   * @param clearCache إذا كانت true سيتم مسح الكاش القديم وبناء السيرفر من الصفر
   */
  const triggerDeploy = async (clearCache: boolean) => {
    try {
      setIsDeploying(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${baseUrl}/api/developer-zone/monitoring/render/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clearCache })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message); // إشعار نجاح فوري للمطور
        fetchMetrics(); // تحديث السجلات والحالة فوراً لمراقبة عملية البناء الجديدة
      } else {
        alert(`❌ فشل إطلاق التحديث: ${result.message}`);
      }
    } catch (error) {
      console.error('Error triggering deploy:', error);
      alert('⚠️ حدث خطأ أثناء محاولة الاتصال بالسيرفر لإطلاق التحديث.');
    } finally {
      setIsDeploying(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // تحديث لايف كل 10 ثوانٍ من سيرفر ريندر الحقيقي
    return () => clearInterval(interval);
  }, []);

  return { status, logs, loading, isDeploying, triggerDeploy, refetch: fetchMetrics };
};
