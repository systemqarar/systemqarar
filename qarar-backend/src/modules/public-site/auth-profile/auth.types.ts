// تعريف مصفوفة الأدوار الـ 19 المعتمدة بالنظام صراحة
public type UserRole =
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

export interface IUser {
  id: string;
  volunteer_id: string;
  national_id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  is_acting: boolean;
  failed_attempts: number;
  locked_until: Date | null;
  created_at: Date;
}

export interface IVolunteerProfile {
  id?: string;
  user_id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  photo_url: string | null;
  is_tot_trainer: boolean;
  current_status_in_khartoum: string;
  expected_return_time?: string | null;
  availability_level?: string | null;
  last_first_aid_refresher?: Date | null;
  other_programs?: string | null;
  tot_year?: number | null;
  tot_certificate_url?: string | null;
  other_certificate_url?: string | null;
}
