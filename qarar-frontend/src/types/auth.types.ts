import { ComponentType } from 'react';

// كتالوج أزرار التنقل الرئيسية في السيستم كله
export interface NavigationItem {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
}

// تعريف مصفوفة الأدوار الـ 19 المعتمدة بالنظام صراحة في الفرونتد
export type UserRole =
  | 'super_admin'
  | 'unit_head' | 'deputy_unit_head'
  | 'unit_secretary' | 'deputy_unit_secretary'
  | 'financial_secretary' | 'deputy_financial_secretary'
  | 'media_secretary' | 'deputy_media_secretary'
  | 'social_secretary' | 'deputy_social_secretary'
  | 'training_youth_secretary' | 'deputy_training_youth_secretary'
  | 'women_secretary' | 'deputy_women_secretary'
  | 'locality_training_director'
  | 'supervisory_office'
  | 'volunteer_trainer'
  | 'volunteer';

// لقطة المتطوع القادمة من نظام الحصر عبر الـ API
export interface IVolunteerSnapshot {
  volunteer_number: string; // التعديل الإداري الصحيح بدلاً من id
  national_id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  photo_url: string | null;
  is_tot_trainer: boolean;
  current_status_in_khartoum: string;
}

// بيانات الجلسة الحالية للمستخدم المسجل
export interface IAuthUser {
  id: string;              // معرف الحساب في جدول المستخدمين (UUID)
  username: string;
  role: UserRole;
  is_acting: boolean;
  volunteer_number?: string; // إضافة حقل رقم المتطوع هنا لربط الجلسة مباشرة بالبروفايل
}

// واجهة إدارة حالة الشاشات الأربعة لإنشاء الحساب (Zustand State)
export interface IRegisterStore {
  step: number;
  volunteerNumber: string; // توحيد المسمى ليطابق رقم المتطوع
  snapshot: IVolunteerSnapshot | null;
  maskedWhatsapp: string;
  setStep: (step: number) => void;
  setVolunteerNumber: (volunteerNumber: string) => void; // تحديث الدالة لتستقبل المسمى الجديد
  setSnapshot: (snapshot: IVolunteerSnapshot | null) => void;
  setMaskedWhatsapp: (whatsapp: string) => void;
  resetStore: () => void;
}
