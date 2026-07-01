// src/modules/unified-dashboard/volunteer-profile/onboarding/onboarding.models.ts

import db from '../../../../config/db'; 
import { UpdateDbPayload } from './onboarding.types';

export const updateVolunteerProfileDb = async (userId: string, data: UpdateDbPayload) => {
  // التحديث المباشر مع ضمان إرسال الكائن نظيفاً بالكامل
  return await db.volunteer_profiles.update({
    where: { user_id: userId },
    data: {
      gender: data.gender,
      date_of_birth: data.date_of_birth,
      marital_status: data.marital_status,
      blood_type: data.blood_type,
      email: data.email,
      education_level: data.education_level,
      job_title: data.job_title,
      detailed_address: data.detailed_address,
      desired_department: data.desired_department,
      is_niqabi: data.is_niqabi,
      photo_url: data.photo_url,
      secure_photo_url: data.secure_photo_url,
      is_profile_completed: data.is_profile_completed,
    }
  });
};
