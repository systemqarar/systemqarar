import { useState, useEffect } from 'react';
import { RenderStatus, RenderLog } from '../types/render.types';

export const useRenderStatus = () => {
  const [status, setStatus] = useState<RenderStatus | null>(null);
  const [logs, setLogs] = useState<RenderLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetrics = async () => {
    try {
      // 🚀 القراءة المباشرة من متغيرات البيئة المحقونة داخل سيرفر فيرسال
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

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // تحديث لايف كل 10 ثوانٍ من سيرفر ريندر
    return () => clearInterval(interval);
  }, []);

  return { status, logs, loading, refetch: fetchMetrics };
};
