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

  const fetchTasks = useCallback(async (activityId?: string) => {
    setLoading(true);
    try {
      const url = activityId 
        ? `/api/unified-dashboard/tasks-activities/tasks-engine/tasks?activity_id=${activityId}`
        : `/api/unified-dashboard/tasks-activities/tasks-engine/tasks`;
      
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      
      if (res.ok) {
        // حماية مرنة لقراءة البيانات سواء كانت داخل data.data أو كمصفوفة مباشرة
        const tasksList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setTasks(tasksList);
      } else {
        setError(data?.error || data?.message || 'تعذر جلب المهام');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب المهام');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/unified-dashboard/tasks-activities/tasks-engine/activities', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        const activitiesList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setActivities(activitiesList);
      }
    } catch (err: any) {
      console.error('Error fetching activities:', err);
    }
  }, []);

  // إنشاء مهمة جديدة
  const createTask = async (taskInput: CreateTaskInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/unified-dashboard/tasks-activities/tasks-engine/tasks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskInput),
      });
      const data = await res.json();
      if (res.ok && (data.success || !data.error)) {
        await fetchTasks();
        return true;
      } else {
        alert(data.error || data.message || 'فشلت العملية');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'تعذر إنشاء المهمة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ إضافة دالة إنشاء نشاط برامجي جديد
  const createActivity = async (activityInput: CreateActivityInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/unified-dashboard/tasks-activities/tasks-engine/activities', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(activityInput),
      });
      const data = await res.json();
      if (res.ok && (data.success || !data.error)) {
        await fetchActivities(); // إعادة جلب الأنشطة فوراً للتحديث
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

  const applyForTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/unified-dashboard/tasks-activities/tasks-engine/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && (data.success || !data.error)) {
        alert('تم الانضمام للفرصة بنجاح!');
        await fetchTasks();
      } else {
        alert(data.error || data.message || 'تعذر التقديم');
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء التقديم');
    }
  };

  const submitExcuse = async (assignmentId: string, reason: string) => {
    try {
      const res = await fetch(`/api/unified-dashboard/tasks-activities/tasks-engine/assignments/${assignmentId}/excuse`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ excuse_reason: reason }),
      });
      const data = await res.json();
      if (res.ok && (data.success || !data.error)) {
        alert('تم تقديم الاعتذار بنجاح');
        await fetchTasks();
      } else {
        alert(data.error || data.message || 'تعذر تقديم الاعتذار');
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء تقديم الاعتذار');
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
    createActivity, // ✅ مضافة للتصدير ومتاحة في الشاشة
    applyForTask,
    submitExcuse,
  };
};
