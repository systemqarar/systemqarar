export interface VolunteerCertificatesData {
  // بيانات الهوية الأساسية (اللازمة للبطاقة الرقمية)
  volunteerId: string;
  volunteerNumber?: string;
  fullName: string;
  nationalId?: string;
  profileImageUrl?: string | null;
  adminPosition?: string;
  gender?: string;
  isNiqabi?: boolean;

  // بيانات الشهادات والتدريب
  isTotTrainer?: boolean;
  totYear?: number | null;
  totCertificateUrl?: string | null;
  otherCertificateUrl?: string | null;
  lastFirstAidRefresher?: string | null;
}
