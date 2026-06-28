// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.models.ts

import db from '../../../../config/db'; 
import { NewProfilePayload } from './personal-data.types';

export class PersonalDataModel {
  
  /**
   * 🔍 دالة ذكية: تجلب البيانات كاملة (الحصر + قرار) سواءً أرسل الفرونت إند الـ UUID أو رقم الحصر (SRCS)
   * تم فتح محبس الاستعلام ليشمل كافة حقول التدريب، الاتصال، والجاهزية الميدانية.
   */
  async findVolunteerById(identifier: string) {
    // الفحص عبر الـ Regex: هل المدخل عبارة عن UUID معقد أم رقم حصر عادي (SRCS)؟
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    // بناء شرط الاستعلام ديناميكياً بناءً على القيمة القادمة من الواجهة (الفرونت إند)
    const condition = isUuid ? `vp.user_id = $1` : `u.volunteer_number = $1`;

    const query = `
      SELECT 
        -- 1️⃣ بيانات الحساب والربط الأساسية
        vp.id, 
        vp.user_id, 
        u.volunteer_number, 
        u.national_id, 
        vp.full_name, 
        vp.photo_url, 
        vp.secure_photo_url,
        vp.admin_position, 
        vp.is_profile_completed,

        -- 2️⃣ بيانات الاتصال (المضافة حديثاً للاستعلام)
        vp.phone,
        vp.whatsapp,

        -- 3️⃣ الحقول الخاصة بنظام قرار
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

        -- 4️⃣ حقول الـ TOT والدورات التدريبية (المضافة حديثاً للاستعلام)
        vp.is_tot_trainer,
        vp.tot_year,
        vp.tot_certificate_url,
        vp.other_certificate_url,
        vp.last_first_aid_refresher,
        vp.other_programs,

        -- 5️⃣ الموقف الميداني والجاهزية (المضافة حديثاً للاستعلام)
        vp.current_status_in_khartoum,
        vp.expected_return_time,
        vp.availability_level

      FROM volunteer_profiles vp
      INNER JOIN users u ON vp.user_id = u.id -- الربط المتين والآمن بين الجدولين
      WHERE ${condition}
    `;
    
    const result = await db.query(query, [identifier]);
    return result.rows[0] || null;
  }

  /**
   * 📥 تحديث البيانات الشخصية في جدول البروفايل وتفعيل حقل إكمال الملف الشخصي
   * (تم الإبقاء عليها لخدمة صفحة الأسئلة التفاعلية Wizard لاحقاً)
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
