// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.models.ts

import db from '../../../../config/db'; 
import { NewProfilePayload } from './personal-data.types';

export class PersonalDataModel {
  
  /**
   * 🔍 دالة ذكية: تجلب البيانات سواءً أرسل الفرونت إند الـ UUID أو رقم الحصر (SRCS)
   * لإنهاء مشكلة تعليق "جاري التحميل" الناتجة عن اختلاف أنواع المعرفات
   */
  async findVolunteerById(identifier: string) {
    // الفحص عبر الـ Regex: هل المدخل عبارة عن UUID معقد أم رقم حصر عادي (SRCS)؟
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    // بناء شرط الاستعلام ديناميكياً بناءً على القيمة القادمة من الواجهة (الفرونت إند)
    const condition = isUuid ? `vp.user_id = $1` : `u.volunteer_number = $1`;

    const query = `
      SELECT 
        vp.id, 
        vp.user_id, 
        u.volunteer_number, 
        u.national_id, -- جلب الرقم الوطني من جدول الحسابات بنجاح
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
      INNER JOIN users u ON vp.user_id = u.id -- الربط المتين والآمن بين الجدولين
      WHERE ${condition}
    `;
    
    const result = await db.query(query, [identifier]);
    return result.rows[0] || null;
  }

  /**
   * 📥 تحديث البيانات الشخصية في جدول البروفايل وتفعيل حقل إكمال الملف الشخصي
   */
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
