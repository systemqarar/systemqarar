import { useState, useEffect } from 'react';
import { FixedData, EditableProfileData, ProfileFetchResponse } from '../types/personal-data.types';

// الرابط الديناميكي المقروء من env فيرسال تلقائياً
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://systemqarar.onrender.com/api';

export const usePersonalData = (volunteerId: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [fixedData, setFixedData] = useState<FixedData>({
    fullName: 'جاري التحميل...',
    volunteerId: volunteerId,
    nationalId: '------------',
  });

  const [formData, setFormData] = useState<EditableProfileData>({
    gender: '',
    birthDate: '',
    bloodType: '',
    maritalStatus: '',
    email: '',
    education: '',
    occupation: '',
    address: '',
    preferredOffice: '',
    isNiqabi: false,
    profileImageUrl: null,
  });

  // 🔄 جلب البيانات فوراً عند فتح الصفحة
  useEffect(() => {
    if (!volunteerId) return;

    fetch(`${BACKEND_URL}/volunteer/profile/${volunteerId}`)
      .then((res) => res.json())
      .then((resData: ProfileFetchResponse) => {
        if (resData.success && resData.data) {
          const d = resData.data;
          setFixedData({
            fullName: d.fullName,
            volunteerId: d.volunteerId,
            nationalId: d.nationalId,
          });
          setFormData({
            gender: d.gender || '',
            birthDate: d.birthDate ? d.birthDate.split('T')[0] : '',
            bloodType: d.bloodType || '',
            maritalStatus: d.maritalStatus || '',
            email: d.email || '',
            education: d.education || '',
            occupation: d.occupation || '',
            address: d.address || '',
            preferredOffice: d.preferredOffice || '',
            isNiqabi: d.isNiqabi || false,
            profileImageUrl: d.profileImageUrl || null,
          });
          setIsCompleted(d.isProfileCompleted || false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching personal data:', err);
        setLoading(false);
      });
  }, [volunteerId]);

  // 📥 دالة حفظ الـ 11 خانة الجديدة
  const savePersonalData = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}/volunteer/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId,
          ...formData, // إرسال الـ 11 خانة فقط بدون تعديل بيانات الحصر الثابتة
        }),
      });
      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'تم تحديث بياناتك الشخصية بنجاح!' });
        setIsCompleted(true);
      } else {
        setMessage({ type: 'error', text: result.message || 'فشل عملية الحفظ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل الاتصال بسيرفر منظومة قرار' });
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    message,
    fixedData,
    formData,
    setFormData,
    savePersonalData,
    isCompleted,
    setMessage
  };
};
