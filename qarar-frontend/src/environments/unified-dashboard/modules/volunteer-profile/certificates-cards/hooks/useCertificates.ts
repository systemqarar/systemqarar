import { useState, useEffect } from 'react';

// 📋 الواجهة المعتمدة لبيانات الشهادات والبطاقة الرقمية في منظومة قرار
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

// 🌐 الـ Hook الموحد لإدارة جلب وحفظ حالة السجل الرقمي للمتطوع
export const useCertificates = (volunteerNumber: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [certificatesData, setCertificatesData] = useState<VolunteerCertificatesData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🛡️ بيانات تجريبية (Mock Data) متكاملة ومطابقة للـ Types لتمرير الـ Build بنجاح
        // ملاحظة: يمكنك لاحقاً ربط هذا الجزء بـ axios أو fetch لجلب البيانات الحقيقية من السيرفر
        const mockData: VolunteerCertificatesData = {
          volunteerId: volunteerNumber,
          fullName: "متطوع منظومة قرار",
          profileImageUrl: null,
          adminPosition: "مكتب الطوارئ والعمليات",
          phone: "0912345678",
          unitName: "مكتب طوارئ محلية جبل أولياء",
          approvedAt: new Date().toISOString(),
          isTotTrainer: true,
          totYear: 2026,
          totCertificateUrl: null,
          otherCertificateUrl: null,
          lastFirstAidRefresher: "2026-05"
        };

        // محاكاة زمن استجابة الشبكة (نصف ثانية) لتظهر علامة التحميل بشكل طبيعي
        setTimeout(() => {
          setCertificatesData(mockData);
          setLoading(false);
        }, 500);

      } catch (err) {
        setError('عذراً، فشل نظام قرار في جلب السجل الرقمي للمتطوع حالياً.');
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

  return { 
    loading, 
    error, 
    certificatesData 
  };
};
