// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.models.ts

import db from '../../../../config/db'; 
import { NewProfilePayload } from './personal-data.types';

export class PersonalDataModel {
  
  // 🔍 جلب البيانات باستخدام الـ user_id (الرابط الحقيقي في نيون)
  async findVolunteerById(userId: string) {
    const query = `
      SELECT id, user_id, volunteer_number, full_name, gender, date_of_birth, 
             blood_type, marital_status, email, education_level, job_title, 
             detailed_address, desired_department, is_niqabi, photo_url, secure_photo_url,
             admin_position, is_profile_completed
       FROM volunteer_profiles 
       WHERE user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }

  // 📥 تحديث البيانات الشخصية بمسمياتها الصحيحة المطابقة لـ Neon DB
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
        is_profile_completed = true, -- تفعيل الحساب تلقائياً
        updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $1;
    `;

    const values = [
      userId, 
      data.gender, 
      data.birthDate, // القادم من فرونت إند
      data.bloodType, 
      data.maritalStatus, 
      data.email, 
      data.education, 
      data.occupation, 
      data.address, 
      data.preferredOffice, 
      data.isNiqabi, 
      data.profileImageUrl
    ];

    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
}
