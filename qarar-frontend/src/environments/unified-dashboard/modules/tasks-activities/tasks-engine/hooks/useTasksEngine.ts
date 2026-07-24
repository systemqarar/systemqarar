import { useState, useEffect, useCallback } from 'react';
import { Task, Activity, CreateTaskInput, CreateActivityInput } from '../types/tasks-engine.types';

export const useTasksEngine = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // دالة مساعدة لجلب التوكن وإضافته للهيدر للأمان
  const getAuthHeaders = () => {
    const token = localStorage.getItem('qarar_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  };

  // دالة مساعدة لمعالجة استجابات الـ API بشكل آمن يمنع كراش الـ JSON
  const parseResponse = async (res: Response) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    console.error(`[API Error ${res.status}]:`, text);
    throw new Error(`خطأ في الاتصال بالسيرفر (${res.status}): المسار غير متطابق أو إعدادات السيرفر بها مشكلة.`);
  };

  // 1. جلب المهام
  const fetchTasks = useCallback(async (activityId?: string) => {
    setLoading(true);
    try {
      const url = activityId 
        ? `/api/tasks-engine/tasks?activity_id=${activityId}`
        : `/api/tasks-engine/tasks`;
      
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await parseResponse(res);
        const tasksList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setTasks(tasksList);
      } else {
        const data = await parseResponse(res);
        setError(data?.error || data?.message || 'تعذر جلب المهام');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب المهام');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. جلب الأنشطة البرامجية
  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks-engine/activities', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await parseResponse(res);
        const activitiesList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setActivities(activitiesList);
      }
    } catch (err: any) {
      console.error('Error fetching activities:', err);
    }
  }, []);

  // 3. إنشاء مهمة جديدة
  const createTask = async (taskInput: CreateTaskInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks-engine/tasks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskInput),
      });
      
      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        await fetchTasks();
        return true;
      } else {
        alert(data.error || data.message || 'فشلت عملية إنشاء المهمة');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'تعذر إنشاء المهمة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. إنشاء نشاط برامجي جديد
  const createActivity = async (activityInput: CreateActivityInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks-engine/activities', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(activityInput),
      });

      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        await fetchActivities();
        return true;
      } else {
        alert(data.error || data.message || 'فشلت عملية إنشاء النشاط');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'تعذر إنشاء النشاط البرامجي');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 5. التقديم على فرصة
  const applyForTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks-engine/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        alert('تم الانضمام للفرصة بنجاح!');
        await fetchTasks();
      } else {
        alert(data.error || data.message || 'تعذر التقديم');
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء التقديم');
    }
  };

  // 6. تقديم اعتذار
  const submitExcuse = async (assignmentId: string, reason: string) => {
    try {
      const res = await fetch(`/api/tasks-engine/assignments/${assignmentId}/excuse`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ excuse_reason: reason }),
      });
      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        alert('تم تقديم الاعتذار بنجاح');
        await fetchTasks();
      } else {
        alert(data.error || data.message || 'تعذر تقديم الاعتذار');
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تقديم الاعتذار');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchActivities();
  }, [fetchTasks, fetchActivities]);

  return {
    tasks,
    activities,
    loading,
    error,
    fetchTasks,
    fetchActivities,
    createTask,
    createActivity,
    applyForTask,
    submitExcuse,
  };
};
