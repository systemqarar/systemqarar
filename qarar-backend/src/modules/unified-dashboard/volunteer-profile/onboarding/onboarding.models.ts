// src/modules/unified-dashboard/volunteer-profile/onboarding/onboarding.models.ts

import db from '../../../../config/db'; // ملف اتصال Neon DB عندك
import { UpdateDbPayload } from './onboarding.types';

export const updateVolunteerProfileDb = async (userId: string, data: UpdateDbPayload) => {
  // التحديث المباشر في جدولك الفعلي باستخدام معرف المستخدم المربوط بالحساب
  return await db.volunteer_profiles.update({
    where: { user_id: userId },
    data: data
  });
};
