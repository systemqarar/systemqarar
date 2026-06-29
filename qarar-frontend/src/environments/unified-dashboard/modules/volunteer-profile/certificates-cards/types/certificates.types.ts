export interface VolunteerCertificatesData {
  volunteerId: string;
  fullName: string;
  nationalId?: string;
  profileImageUrl?: string | null;
  adminPosition?: string;
  gender?: string;
  isNiqabi?: boolean;
  phone?: string;          // 🆕 أضفنا الهاتف للبطاقة
  unitName?: string | null; // 🆕 أضفنا الوحدة الإدارية للبطاقة
  approvedAt?: string | null;

  // الشهادات
  isTotTrainer?: boolean;
  totYear?: number | null;
  totCertificateUrl?: string | null;
  otherCertificateUrl?: string | null;
  lastFirstAidRefresher?: string | null;
}
