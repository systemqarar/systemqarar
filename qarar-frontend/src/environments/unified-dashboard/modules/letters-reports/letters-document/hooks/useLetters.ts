import { useState, useCallback } from 'react';
import apiClient from '../../../../../../api/api-client'; // 👈 المسار الدقيق لملف الاتصال الفعلي بتاعك
import { ILetter, ICreateLetterInput } from '../types/letters-document.types';

export const useLetters = () => {
  const [inboxLetters, setInboxLetters] = useState<ILetter[]>([]);
  const [sentLetters, setSentLetters] = useState<ILetter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. جلب خطابات صندوق الوارد
  const fetchInbox = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/letters-reports/document/inbox');
      if (response.data.success) {
        setInboxLetters(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في جلب خطابات صندوق الوارد');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. جلب خطابات صندوق الصادر
  const fetchSent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/letters-reports/document/sent');
      if (response.data.success) {
        setSentLetters(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في جلب خطابات صندوق الصادر');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. دالة إرسال وإنشاء خطاب رسمي جديد
  const createLetter = async (input: ICreateLetterInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/letters-reports/document/create', input);
      if (response.data.success) {
        setSentLetters((prev) => [response.data.data, ...prev]);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إرسال الخطاب الرسمي');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. دالة استدعاء المساعد الرقمي غيث لإعادة صياغة الخطاب باحترافية
  const generateAIDraft = async (userPrompt: string, letterType: string): Promise<string | null> => {
    setAiLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/letters-reports/document/ai-draft', { userPrompt, letterType });
      if (response.data.success) {
        return response.data.draftedContent;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل غيث في صياغة النص حالياً');
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  return {
    inboxLetters,
    sentLetters,
    loading,
    aiLoading,
    error,
    fetchInbox,
    fetchSent,
    createLetter,
    generateAIDraft,
  };
};
