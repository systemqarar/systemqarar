import { useState, useEffect } from 'react';
import { RenderStatus, RenderLog } from '../types/render.types';

export const useRenderStatus = () => {
  const [status, setStatus] = useState<RenderStatus | null>(null);
  const [logs, setLogs] = useState<RenderLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeploying, setIsDeploying] = useState<boolean>(false); 

  const fetchMetrics = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      if (!baseUrl) {
        console.warn('⚠️ تنبيه للمطور: لم يتم العثور على المتغير VITE_API_BASE_URL في إعدادات فيرسال بعد.');
      }
      
      const token = localStorage.getItem('token'); 

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
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
   * 🔥 ميزة التحكم المتقدمة المحدثة لصيد الأخطاء الحقيقية
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
        alert(result.message || '🚀 تم إطلاق التحديث بنجاح!'); 
        fetchMetrics(); 
      } else {
        // 🛠️ هنا التعديل الذكي: يقرأ message أو error أو أي نص يرسله السيرفر لمنع ظهور undefined
        const serverError = result.error || result.message || 'خطأ غير معروف في الصلاحيات';
        alert(`❌ فشل إطلاق التحديث: ${serverError}`);
      }
    } catch (error: any) {
      console.error('Error triggering deploy:', error);
      alert(`⚠️ حدث خطأ أثناء الاتصال بالسيرفر: ${error.message || error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); 
    return () => clearInterval(interval);
  }, []);

  return { status, logs, loading, isDeploying, triggerDeploy, refetch: fetchMetrics };
};
