import { useState, useEffect } from 'react';

// الرابط الديناميكي المقروء من env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://systemqarar.onrender.com/api';

// 🆕 تعريف واجهة بيانات شاملة ومؤمنة لمنع أي خطأ تعليق في الـ TypeScript
export interface FullProfileData {
  id?: string;
  userId?: string;
  volunteerNumber?: string;
  nationalId?: string;
  fullName: string;
  profileImageUrl?: string | null;
  securePhotoUrl?: string | null;
  isProfileCompleted?: boolean;
  adminPosition?: string;
  phone?: string;
  whatsapp?: string;
  gender?: string;
  birthDate?: string;
  bloodType?: string;
  maritalStatus?: string;
  email?: string;
  education?: string;
  occupation?: string;
  address?: string;
  preferredOffice?: string;
  isNiqabi?: boolean;
  isTotTrainer?: boolean;
  totYear?: number | null;
  totCertificateUrl?: string | null;
  otherCertificateUrl?: string | null;
  lastFirstAidRefresher?: string | null;
  otherPrograms?: string | null;
  currentStatusInKhartoum?: string;
  expectedReturnTime?: string | null;
  availabilityLevel?: string | null;
}

export const usePersonalData = (volunteerId: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 🎯 مصدر الحقيقة الواحد: كائن شامل لكل حقول المتطوع (حصر + قرار)
  const [profileData, setProfileData] = useState<FullProfileData>({
    fullName: 'جاري التحميل...',
    volunteerId: volunteerId,
    nationalId: '------------',
  });

  // 🔄 جلب البيانات فوراً عند فتح الصفحة الشخصية
  useEffect(() => {
    if (!volunteerId) return;

    fetch(`${BACKEND_URL}/volunteer/profile/${volunteerId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const d = resData.data;
          
          // 📥 تخزين كافة البيانات القادمة من الباكيند بدون استثناء أو فلترة عمياء
          setProfileData({
            ...d,
            birthDate: d.birthDate ? d.birthDate.split('T')[0] : '', // تنظيف صيغة التاريخ للعرض
          });
          
          setIsCompleted(d.isProfileCompleted || false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching full personal data:', err);
        setLoading(false);
      });
  }, [volunteerId]);

  // 📥 دالة الحفظ (تركناها مأمنة وجاهزة لتخدم صفحة الأسئلة التفاعلية Wizard لاحقاً)
  const savePersonalData = async (updatedFields: Partial<FullProfileData>) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}/volunteer/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId,
          ...updatedFields, 
        }),
      });
      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'تم تحديث البيانات بنجاح!' });
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
    profileData, // ⬅️ مررنا الكائن الشامل الجديد
    savePersonalData,
    isCompleted,
    setMessage
  };
};
