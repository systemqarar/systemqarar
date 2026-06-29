// src/modules/unified-dashboard/volunteer-profile/certificates-cards/hooks/useCertificates.ts

import { useState, useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://systemqarar.onrender.com/api';

export interface VolunteerCertificatesData {
  volunteerId: string;
  fullName: string;
  profileImageUrl?: string | null;
  adminPosition?: string;
  phone?: string;
  unitName?: string | null;
  approvedAt?: string | null;
  isTotTrainer?: boolean;
  totYear?: number | null;
  totCertificateUrl?: string | null;
  otherCertificateUrl?: string | null;
  lastFirstAidRefresher?: string | null;
}

export const useCertificates = (volunteerNumber: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [certificatesData, setCertificatesData] = useState<VolunteerCertificatesData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🚀 الربط الحقيقي والديناميكي المباشر مع سيرفر قرار بدون بيانات وهمية
        const response = await fetch(`${BACKEND_URL}/volunteer/profile/certificates-cards/${volunteerNumber}`);
        const resData = await response.json();

        if (resData.success && resData.data) {
          setCertificatesData(resData.data);
        } else {
          setError(resData.message || 'عذراً، فشل نظام قرار في جلب السجل الرقمي.');
        }
        setLoading(false);

      } catch (err) {
        console.error('Error fetching real certificates:', err);
        setError('عذراً، فشل الاتصال بسيرفر منظومة قرار حالياً.');
        setLoading(false);
      }
    };

    if (volunteerNumber) {
      fetchData();
    } else {
      setError('رقم المتطوع غير صحيح أو مفقود.');
      setLoading(false);
    }
  }, [volunteerNumber]);

  return { loading, error, certificatesData };
};
