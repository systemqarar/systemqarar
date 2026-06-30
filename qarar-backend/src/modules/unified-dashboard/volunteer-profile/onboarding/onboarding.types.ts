// src/modules/unified-dashboard/volunteer-profile/onboarding/onboarding.types.ts

export interface OnboardingInputData {
  gender: string;
  date_of_birth: string;        // متطابق مع الداتابيز
  marital_status: string;       // متطابق مع الداتابيز
  blood_type: string;           // متطابق مع الداتابيز
  email: string;                // متطابق مع الداتابيز
  education_level: string;      // متطابق مع الداتابيز
  job_title: string;            // متطابق مع الداتابيز
  main_address: string;         // القادم من قائمة الفرونتد
  detailed_address: string;     // تفاصيل السكن
  desired_department: string;   // متطابق مع الداتابيز (المكاتب السبعة)
  is_niqabi: boolean;           // متطابق مع الداتابيز
  photo_url: string;            // 🔥 تم التعديل: الرابط العام الجاهز من كلاودنري (المشوش للمنقبات أو الطبيعي للعامة)
  secure_photo_url: string;     // 🌟 تم الإضافة: الرابط الصافي المؤمن الجاهز من كلاودنري للشهادات الإدارية
}

export interface UpdateDbPayload {
  gender: string;
  date_of_birth: Date;
  marital_status: string;
  blood_type: string;
  email: string;
  education_level: string;
  job_title: string;
  detailed_address: string;
  desired_department: string;
  is_niqabi: boolean;
  photo_url: string;
  secure_photo_url: string;
  is_profile_completed: boolean;
}
