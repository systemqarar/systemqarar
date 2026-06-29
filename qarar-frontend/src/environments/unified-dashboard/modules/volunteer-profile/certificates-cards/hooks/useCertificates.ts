import { useState, useEffect } from 'react';
import { VolunteerCertificatesData } from '../types/certificates.types';

// الرابط الديناميكي المقروء من env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://systemqarar.onrender.com/api';

export const useCertificates = (volunteerId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificatesData, setCertificatesData] = useState<VolunteerCertificatesData | null>(null);

  useEffect(() => {
    if (!volunteerId) return;

    fetch(`${BACKEND_URL}/volunteer/profile/${volunteerId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const d = resData.data;
          
          // تأمين وضمان قراءة البيانات المطلوبة للموديول الجديد
          setCertificatesData({
            volunteerId: d.volunteerId || d.volunteerNumber || volunteerId,
            volunteerNumber: d.volunteerNumber,
            fullName: d.fullName || 'متطوع غير مسمى',
            nationalId: d.nationalId,
            profileImageUrl: d.profileImageUrl,
            adminPosition: d.adminPosition,
            gender: d.gender,
            isNiqabi: d.isNiqabi,
            isTotTrainer: d.isTotTrainer,
            totYear: d.totYear,
            totCertificateUrl: d.totCertificateUrl,
            otherCertificateUrl: d.otherCertificateUrl,
            lastFirstAidRefresher: d.lastFirstAidRefresher
          });
        } else {
          setError(resData.message || 'فشل في تحميل بيانات الشهادات والبطاقة');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching certificates data:', err);
        setError('فشل الاتصال بسيرفر منظومة قرار');
        setLoading(false);
      });
  }, [volunteerId]);

  return {
    loading,
    error,
    certificatesData
  };
};
