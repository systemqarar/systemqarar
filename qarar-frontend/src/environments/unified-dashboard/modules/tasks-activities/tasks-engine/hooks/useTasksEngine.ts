import { useState, useEffect, useCallback } from 'react';
import { Task, Activity, CreateTaskInput } from '../types/tasks-engine.types';

export const useTasksEngine = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (activityId?: string) => {
    setLoading(true);
    try {
      const url = activityId 
        ? `/api/unified-dashboard/tasks-activities/tasks-engine/tasks?activity_id=${activityId}`
        : `/api/unified-dashboard/tasks-activities/tasks-engine/tasks`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب المهام');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/unified-dashboard/tasks-activities/tasks-engine/activities');
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching activities:', err);
    }
  }, []);

  const createTask = async (taskInput: CreateTaskInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/unified-dashboard/tasks-activities/tasks-engine/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskInput),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
        return true;
      } else {
        alert(data.message);
        return false;
      }
    } catch (err: any) {
      alert(err.message || 'تعذر إنشاء المهمة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const applyForTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/unified-dashboard/tasks-activities/tasks-engine/tasks/${taskId}/apply`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert('تم الانضمام للفرصة بنجاح!');
        await fetchTasks();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء التقديم');
    }
  };

  const submitExcuse = async (assignmentId: string, reason: string) => {
    try {
      const res = await fetch(`/api/unified-dashboard/tasks-activities/tasks-engine/assignments/${assignmentId}/excuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excuse_reason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        alert('تم تقديم الاعتذار بنجاح');
        await fetchTasks();
      } else {
        alert(data.message);
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
    createTask,
    applyForTask,
    submitExcuse,
  };
};
