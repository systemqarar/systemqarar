// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.models.ts

import db from '../../../../config/db'; 
import { NewProfilePayload } from './personal-data.types';

export class PersonalDataModel {
  
  // 🔍 جلب البيانات الكاملة بدمج جدول الحسابات مع جدول البروفايل بشكل صحيح
  async findVolunteerById(userId: string) {
    const query = `
      SELECT 
        vp.id, 
        vp.user_id, 
        u.volunteer_number, 
        u.national_id, -- تم جلب الرقم الوطني من جدول users بنجاح
        vp.full_name, 
        vp.gender, 
        vp.date_of_birth, 
        vp.blood_type, 
        vp.marital_status, 
        vp.email, 
        vp.education_level, 
        vp.job_title, 
        vp.detailed_address, 
        vp.desired_department, 
        vp.is_niqabi, 
        vp.photo_url, 
        vp.secure_photo_url,
        vp.admin_position, 
        vp.is_profile_completed
      FROM volunteer_profiles vp
      INNER JOIN users u ON vp.user_id = u.id -- الربط المتين بين الجدولين
      WHERE vp.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }

  // 📥 تحديث البيانات الشخصية وتفعيل حقل إكمال الملف الشخصي
  async updateVolunteerProfile(userId: string, data: NewProfilePayload) {
    const query = `
      UPDATE volunteer_profiles 
      SET 
        gender = $2,
        date_of_birth = $3,
        blood_type = $4,
        marital_status = $5,
        email = $6,
        education_level = $7,
        job_title = $8,
        detailed_address = $9,
        desired_department = $10,
        is_niqabi = $11,
        photo_url = $12,
        is_profile_completed = true,
        updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $1;
    `;

    const values = [
      userId, data.gender, data.birthDate, data.bloodType, data.maritalStatus, 
      data.email, data.education, data.occupation, data.address, data.preferredOffice, 
      data.isNiqabi, data.profileImageUrl
    ];

    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
}
