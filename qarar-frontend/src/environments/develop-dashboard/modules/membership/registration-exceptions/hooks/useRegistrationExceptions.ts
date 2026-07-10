import { useState, useEffect } from 'react';
import { ExceptionMember } from '../types/exceptions.types';

export const useRegistrationExceptions = () => {
  const [exceptions, setExceptions] = useState<ExceptionMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // جلب القائمة
  const fetchExceptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/developer-zone/membership/exceptions');
      if (!res.ok) throw new Error('فشل جلب قائمة الاستثناءات من السيرفر');
      const data = await res.json();
      setExceptions(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  // إضافة عضو جديد
  const addException = async (memberData: Omit<ExceptionMember, 'id' | 'has_registered' | 'created_at'>) => {
    try {
      setActionLoading('add');
      const res = await fetch('/api/developer-zone/membership/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'فشل إضافة العضو');
      }
      await fetchExceptions(); // تحديث القائمة فوراً
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    } finally {
      setActionLoading(null);
    }
  };

  // حذف وإلغاء استثناء
  const deleteException = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/developer-zone/membership/exceptions/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('فشل عملية الحذف من السيرفر');
      setExceptions(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    } finally {
      setActionLoading(null);
    }
  };

  return { exceptions, loading, error, actionLoading, addException, deleteException, refresh: fetchExceptions };
};
