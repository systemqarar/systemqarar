import { useState, useEffect } from 'react';

// الرابط الديناميكي المقروء من env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://systemqarar.onrender.com/api';

// 🆕 الواجهة الشاملة المحدثة والمؤمنة لتخطي خطأ الـ Build
export interface FullProfileData {
  id?: string;
  userId?: string;
  volunteerNumber?: string;
  volunteerId?: string; // 👈 هنا السر: أضفنا التعريف لحل خطأ الـ TS2353
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

  // 🎯 الآن التايب سكريبت حيرضى تماماً عن الـ Object literal دا
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
          
          // 📥 تخزين كافة البيانات وتأمين وجود المعرف بالجهتين
          setProfileData({
            ...d,
            volunteerId: d.volunteerId || d.volunteerNumber || volunteerId,
            birthDate: d.birthDate ? d.birthDate.split('T')[0] : '', 
          });
          
          setIsCompleted(d.isProfileCompleted || false);
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching full personal data:', err);
        setLoading(false);
      });
  }, [volunteerId]);

  // 📥 دالة الحفظ الذكية
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
    profileData, 
    savePersonalData,
    isCompleted,
    setMessage
  };
};
