import { useState, useEffect, useCallback } from 'react';
import { 
  Task, 
  Activity, 
  CreateTaskInput, 
  CreateActivityInput, 
  UpdateTaskInput, 
  CreateCommitteeInput 
} from '../types/tasks-engine.types';

// واجهة تعريفية للمتطوع المسترجع في قائمة البحث (Autocomplete)
export interface VolunteerSearchOption {
  id: string; // uuid المقابل لـ user_id
  full_name: string;
  volunteer_number: string;
}

export const useTasksEngine = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // استخراج معرّفات المستخدم الحالي من التخزين المحلي
  const currentUserId = localStorage.getItem('user_id') || localStorage.getItem('userId') || undefined;
  const currentVolunteerNumber = localStorage.getItem('volunteer_number') || undefined;

  // 🎯 المسار الموحد والمطابق للباكيند بدقة
  const API_BASE = '/api/tasks-activities/tasks-engine';

  // دالة جلب التوكن وترويسة الطلب
  const getAuthHeaders = () => {
    const token = localStorage.getItem('qarar_token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  };

  // معالجة الاستجابات بأمان لمنع كراش التطبيق
  const parseResponse = async (res: Response) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    console.error(`[API Error ${res.status}]:`, text);
    throw new Error(`خطأ في الاتصال بالسيرفر (${res.status})`);
  };

  // 🔍 البحث الفوري عن المتطوعين بالاسم أو الرقم للـ Autocomplete Selector
  const searchVolunteers = useCallback(async (query: string): Promise<VolunteerSearchOption[]> => {
    if (!query.trim()) return [];
    try {
      const res = await fetch(`/api/volunteers/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await parseResponse(res);
        return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      }
      return [];
    } catch (err) {
      console.error('Error searching volunteers:', err);
      return [];
    }
  }, []);

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

  // 2. جلب تفاصيل نشاط محدد
  const fetchActivityById = useCallback(async (activityId: string) => {
    if (!activityId) return null;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/activities/${activityId}`, {
        headers: getAuthHeaders(),
      });

      const data = await parseResponse(res);

      if (res.ok && (data.success || data.id || data.data)) {
        const activityData = data.data !== undefined ? data.data : data;
        
        if (activityData) {
          setCurrentActivity(activityData);
          return activityData as Activity;
        } else {
          setError('لم يتم العثور على بيانات هذا النشاط في قاعدة البيانات.');
          setCurrentActivity(null);
          return null;
        }
      } else {
        const errMsg = data?.message || data?.error || 'تعذر جلب تفاصيل النشاط';
        setError(errMsg);
        setCurrentActivity(null);
        return null;
      }
    } catch (err: any) {
      console.error(`❌ [useTasksEngine] خطأ أثناء جلب النشاط:`, err);
      setError(err.message || 'حدث خطأ أثناء جلب تفاصيل النشاط');
      setCurrentActivity(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // 3. جلب المهام
  const fetchTasks = useCallback(async (filters?: { activity_id?: string; committee_id?: string; is_standalone?: boolean; status?: string }) => {
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
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
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

  // 5. إضافة لجنة جديدة
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

  // 6. إنشاء مهمة
  const createTask = async (taskInput: CreateTaskInput): Promise<boolean> => {
    setLoading(true);

    try {
      const cleanPayload = {
        ...taskInput,
        committee_id: taskInput.committee_id || null,
      };

      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cleanPayload),
      });

      const data = await parseResponse(res);

      if (res.ok && (data.success || data.id || !data.error)) {
        if (taskInput.activity_id) {
          await fetchActivityById(taskInput.activity_id);
        }
        await fetchTasks();
        return true;
      } else {
        const errMsg = data.error || data.message || 'فشلت عملية إنشاء المهمة';
        alert(errMsg);
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'تعذر إنشاء المهمة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 7. تحديث مهمة
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
        }
        await fetchTasks();
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
        if (currentActivity?.id) {
          await fetchActivityById(currentActivity.id);
        }
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

  // 9. تقديم اعتذار عن مهمة
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
        if (currentActivity?.id) {
          await fetchActivityById(currentActivity.id);
        }
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

  // 10. إسناد متطوع يدوي لمهمة
  const assignVolunteer = async (taskId: string, volunteerId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ volunteer_id: volunteerId }),
      });
      const data = await parseResponse(res);
      if (res.ok && (data.success || !data.error)) {
        alert('تم إسناد المتطوع بنجاح');
        await fetchTasks();
        if (currentActivity?.id) {
          await fetchActivityById(currentActivity.id);
        }
        return true;
      } else {
        alert(data.error || data.message || 'تعذر إسناد المتطوع');
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الإسناد');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 11. إزالة متطوع
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
        }
        await fetchTasks();
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

  // جلب البيانات الأولية عند التهيئة
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
    currentUserId,
    currentVolunteerNumber,
    fetchTasks,
    fetchActivities,
    fetchActivityById,
    createTask,
    createActivity,
    addCommittee,
    updateTask,
    applyForTask,
    submitExcuse,
    assignVolunteer,
    removeVolunteer,
    searchVolunteers,
  };
};
