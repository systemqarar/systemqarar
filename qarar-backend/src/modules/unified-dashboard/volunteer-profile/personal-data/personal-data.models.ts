// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.models.ts

import { db } from '../../../../config/database'; 
import { NewProfilePayload } from './personal-data.types';

export class PersonalDataModel {
  
  // 🔍 جلب البيانات الكاملة من جدول volunteer_profiles
  async findVolunteerById(volunteerId: string) {
    const query = `
      SELECT volunteer_id, full_name, national_id, gender, birth_date, 
              blood_type, marital_status, email, education, occupation, 
              address, preferred_office, is_niqabi, profile_image_url, 
              admin_role, is_profile_completed
       FROM volunteer_profiles 
       WHERE volunteer_id = $1
    `;
    const result = await db.query(query, [volunteerId]);
    return result.rows[0] || null;
  }

  // 📥 تحديث البيانات الشخصية وتفعيل حقل إكمال الملف الشخصي
  async updateVolunteerProfile(volunteerId: string, data: NewProfilePayload) {
    const query = `
      UPDATE volunteer_profiles 
      SET 
        gender = $2,
        birth_date = $3,
        blood_type = $4,
        marital_status = $5,
        email = $6,
        education = $7,
        occupation = $8,
        address = $9,
        preferred_office = $10,
        is_niqabi = $11,
        profile_image_url = $12,
        is_profile_completed = true, -- تفعيل الحساب تلقائياً لفتح الـ Dashboard
        updated_at = CURRENT_TIMESTAMP -- تحديث وقت التعديل تلقائياً
      WHERE volunteer_id = $1;
    `;

    const values = [
      volunteerId, data.gender, data.birthDate, data.bloodType, data.maritalStatus, 
      data.email, data.education, data.occupation, data.address, data.preferredOffice, 
      data.isNiqabi, data.profileImageUrl
    ];

    const result = await db.query(query, values);
    return result.rowCount > 0;
  }
}
