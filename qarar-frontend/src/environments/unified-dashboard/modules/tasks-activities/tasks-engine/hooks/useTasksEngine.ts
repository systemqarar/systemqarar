import { useState, useEffect, useCallback } from 'react';
import { 
  Task, 
  Activity, 
  CreateTaskInput, 
  CreateActivityInput, 
  UpdateTaskInput, 
  CreateCommitteeInput 
} from '../types/tasks-engine.types';

export const useTasksEngine = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // البادئة الموحدة والرسمية لمسارات السيرفر
  const API_BASE = '/api/tasks-activities/tasks-engine';

  // دالة مساعدة لجلب التوكن وإضافته للهيدر للأمان
  const getAuthHeaders = () => {
    const token = localStorage.getItem('qarar_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  };

  // معالجة الاستجابات بأمان يمنع كراش الـ JSON
  const parseResponse = async (res: Response) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    console.error(`[API Error ${res.status}]:`, text);
    throw new Error(`خطأ في الاتصال بالسيرفر (${res.status}).`);
  };

  // 1. جلب الأنشطة البرامجية الرئيسية
  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/activities`, {
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
  }, [API_BASE]);

  // 2. جلب تفاصيل نشاط واحد بالكامل بالهيكل الشجري (لصفحة ActivityDetailsPage)
  const fetchActivityById = useCallback(async (activityId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/activities/${activityId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await parseResponse(res);
        const activityData = data?.data || data;
        setCurrentActivity(activityData);
        return activityData as Activity;
      } else {
        const data = await parseResponse(res);
        setError(data?.error || data?.message || 'تعذر جلب تفاصيل النشاط');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب تفاصيل النشاط');
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // 3. جلب المهام مع دعم التصفية المتقدمة (مستقلة / تابعة لنشاط / لجنة)
  const fetchTasks = useCallback(async (filters?: { activity_id?: string; committee_id?: string; is_standalone?: boolean; status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.activity_id) params.append('activity_id', filters.activity_id);
      if (filters?.committee_id) params.append('committee_id', filters.committee_id);
      if (filters?.is_standalone) params.append('is_standalone', 'true');
      if (filters?.status) params.append('status', filters.status);

      const queryString = params.toString();
      const url = queryString ? `${API_BASE}/tasks?${queryString}` : `${API_BASE}/tasks`;

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
  }, [API_BASE]);

  // 4. إنشاء نشاط برامجي جديد
  const createActivity = async (activityInput: CreateActivityInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/activities`, {
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

  // 5. إضافة لجنة جديدة لنشاط قائم
  const addCommittee = async (activityId: string, committeeInput: CreateCommitteeInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/activities/${activityId}/committees`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(committeeInput),
      });

      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        await fetchActivityById(activityId);
        return true;
      } else {
        alert(data.error || data.message || 'فشلت عملية إضافة اللجنة');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'تعذر إضافة اللجنة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 6. إنشاء مهمة جديدة (مستقلة أو فرعية)
  const createTask = async (taskInput: CreateTaskInput): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskInput),
      });

      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        if (taskInput.activity_id) {
          await fetchActivityById(taskInput.activity_id);
        } else {
          await fetchTasks({ is_standalone: true });
        }
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

  // 7. تحديث مهمة قائمة (زيادة عدد المتطوعين / تغيير التاريخ / الحالة)
  const updateTask = async (taskId: string, updateInput: UpdateTaskInput, activityId?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateInput),
      });

      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        if (activityId) {
          await fetchActivityById(activityId);
        } else {
          await fetchTasks({ is_standalone: true });
        }
        return true;
      } else {
        alert(data.error || data.message || 'فشلت عملية تحديث المهمة');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'تعذر تحديث المهمة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 8. التقديم على فرصة
  const applyForTask = async (taskId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        alert('تم الانضمام للفرصة بنجاح!');
        await fetchTasks();
        return true;
      } else {
        alert(data.error || data.message || 'تعذر التقديم');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء التقديم');
      return false;
    }
  };

  // 9. تقديم اعتذار
  const submitExcuse = async (assignmentId: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/assignments/${assignmentId}/excuse`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ excuse_reason: reason }),
      });
      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        alert('تم تقديم الاعتذار بنجاح');
        await fetchTasks();
        return true;
      } else {
        alert(data.error || data.message || 'تعذر تقديم الاعتذار');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تقديم الاعتذار');
      return false;
    }
  };

  // 10. إزالة متطوع من المهمة (للمسؤولين أو قادة اللجان)
  const removeVolunteer = async (assignmentId: string, activityId?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        alert('تم إزالة المتطوع بنجاح');
        if (activityId) {
          await fetchActivityById(activityId);
        } else {
          await fetchTasks();
        }
        return true;
      } else {
        alert(data.error || data.message || 'تعذر إزالة المتطوع');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إزالة المتطوع');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchActivities();
  }, [fetchTasks, fetchActivities]);

  return {
    tasks,
    activities,
    currentActivity,
    loading,
    error,
    fetchTasks,
    fetchActivities,
    fetchActivityById,
    createTask,
    createActivity,
    addCommittee,
    updateTask,
    applyForTask,
    submitExcuse,
    removeVolunteer,
  };
};
