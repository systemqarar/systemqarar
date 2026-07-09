// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.models.ts

import db from '../../../../config/db'; 
import { NewProfilePayload } from './personal-data.types';

export class PersonalDataModel {
  
  /**
   * 🔍 دالة ذكية: تجلب البيانات كاملة (الحصر + قرار)
   */
  async findVolunteerById(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const condition = isUuid ? `vp.user_id = $1` : `u.volunteer_number = $1`;

    // ✅ تم الإصلاح: استبدال vp.admin_position بـ vp.admin_position_id لمنع خطأ الـ 500
    // 🎯 إضافة حاسمة: جلب vp.unit_name ليعرض اسم وحدة المتطوع ديناميكياً في صفحته الشخصية
    const query = `
      SELECT 
        vp.id, vp.user_id, u.volunteer_number, u.national_id, vp.full_name, 
        vp.photo_url, vp.secure_photo_url, vp.admin_position_id, vp.unit_name, vp.is_profile_completed,
        vp.phone, vp.whatsapp, vp.gender, vp.date_of_birth, vp.blood_type, 
        vp.marital_status, vp.email, vp.education_level, vp.job_title, 
        vp.detailed_address, vp.desired_department, vp.is_niqabi,
        vp.is_tot_trainer, vp.tot_year, vp.tot_certificate_url, vp.other_certificate_url,
        vp.last_first_aid_refresher, vp.other_programs,
        vp.current_status_in_khartoum, vp.expected_return_time, vp.availability_level
      FROM volunteer_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE ${condition}
    `;
    
    const result = await db.query(query, [identifier]);
    return result.rows[0] || null;
  }

  /**
   * 📥 تحديث البيانات الشخصية في جدول البروفايل (تم ربط المنصب الإداري المحدث)
   */
  async updateVolunteerProfile(userId: string, data: any) {
    // ⚡ تم التطوير: إلحاق وحفظ حقل admin_position_id المتوافق مع الكنترولر والداتابيز
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
        secure_photo_url = $13,
        admin_position_id = $14,
        is_profile_completed = true
      WHERE user_id = $1;
    `;

    // ترتيب المصفوفة وتأمين حقل المنصب الإداري لتجنب تمرير القيم غير المعرفة لقاعدة البيانات
    const values = [
      userId, 
      data.gender, 
      data.date_of_birth, 
      data.blood_type, 
      data.marital_status, 
      data.email, 
      data.education_level, 
      data.job_title, 
      data.detailed_address, 
      data.desired_department, 
      data.is_niqabi, 
      data.photo_url,          // الرابط المشوه (بكسلة + ضبابية)
      data.secure_photo_url,   // الرابط الأصلي النقي المؤمّن للمنقبات
      data.admin_position_id || null // المنصب الإداري الجديد المترجم من الكنترولر
    ];

    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
}
