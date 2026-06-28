// 1️⃣ واجهة البيانات كما هي مخزنة في قاعدة البيانات (PostgreSQL Row - snake_case)
// دي عشان الـ Controller والـ Model يتعرفوا على الحقول الجاية من الـ Database مباشرة
export interface VolunteerDbRow {
  id: string;
  user_id: string;
  volunteer_number: string;
  national_id?: string;
  full_name: string;
  phone?: string;
  whatsapp?: string;
  photo_url?: string;
  secure_photo_url?: string;
  is_profile_completed: boolean;
  admin_position?: string;
  gender?: string;
  date_of_birth?: string;
  blood_type?: string;
  marital_status?: string;
  email?: string;
  education_level?: string;
  job_title?: string;
  detailed_address?: string;
  desired_department?: string;
  is_niqabi?: boolean;
  
  // حقول الـ TOT والتدريب المستوردة من نظام الحصر
  is_tot_trainer?: boolean;
  tot_year?: number | null;
  tot_certificate_url?: string | null;
  other_certificate_url?: string | null;
  last_first_aid_refresher?: string | null;
  other_programs?: string | null;
  
  // الموقف الميداني والجاهزية المستوردة من نظام الحصر
  current_status_in_khartoum?: string;
  expected_return_time?: string | null;
  availability_level?: string | null;
}

// 2️⃣ البيانات الثابتة المستوردة من نظام الحصر (تحديث وتوسيع لتشمل بيانات الاتصال والتدريب)
export interface FixedCensusData {
  fullName: string;
  volunteerId: string;
  nationalId: string;
  phone?: string;
  whatsapp?: string;
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

// 3️⃣ البيانات الجديدة الحصرية لنظام قرار (التي يتم إرسالها في طلب حفظ وتحديث الملف)
export interface NewProfilePayload {
  gender: string;
  birthDate: string;
  bloodType: string;
  maritalStatus: string;
  email: string;
  education: string;
  occupation: string;
  address: string;
  preferredOffice: string;
  isNiqabi: boolean;
  profileImageUrl: string | null;
  adminPosition?: string | null;
  isProfileCompleted?: boolean;
}
