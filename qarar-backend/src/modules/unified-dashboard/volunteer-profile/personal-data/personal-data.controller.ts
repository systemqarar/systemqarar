// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.controller.ts

import { Request, Response } from 'express';
import { PersonalDataModel } from './personal-data.models';

const model = new PersonalDataModel();

export class PersonalDataController {
  
  // 🔍 جلب بيانات الملف الشخصي كاملة (الحصر + قرار) للقراءة
  async getProfileData(req: Request, res: Response): Promise<void> {
    try {
      // استلام القيمة القادمة من الرابط (سواء كانت UUID أو رقم الحصر SRCS)
      const { identifier } = req.params;

      if (!identifier) {
        res.status(400).json({ success: false, message: 'المُعرّف مطلوب' });
        return;
      }

      // استدعاء الدالة الذكية من الموديل
      const volunteer = await model.findVolunteerById(identifier);

      if (!volunteer) {
        res.status(404).json({ success: false, message: 'لم يتم العثور على المتطوع' });
        return;
      }

      // 🛠️ إرجاع كافة البيانات في قالب JSON نظيف يشمل الحقول المستوردة والجديدة لتغذية الفرونتد
      res.status(200).json({
        success: true,
        data: {
          // 1️⃣ بيانات الربط والحساب الأساسية
          id: volunteer.id,
          userId: volunteer.user_id,
          volunteerNumber: volunteer.volunteer_number,
          nationalId: volunteer.national_id, 
          fullName: volunteer.full_name,
          profileImageUrl: volunteer.photo_url,
          securePhotoUrl: volunteer.secure_photo_url,
          isProfileCompleted: volunteer.is_profile_completed,
          adminPosition: volunteer.admin_position,

          // 2️⃣ بيانات الاتصال (المستوردة حديثاً للواجهة)
          phone: volunteer.phone,
          whatsapp: volunteer.whatsapp,

          // 3️⃣ الحقول الجديدة الخاصة بنظام قرار (التي ستُملأ عبر صفحة الأسئلة)
          gender: volunteer.gender,
          birthDate: volunteer.date_of_birth,
          bloodType: volunteer.blood_type,
          maritalStatus: volunteer.marital_status,
          email: volunteer.email,
          education: volunteer.education_level,
          occupation: volunteer.job_title,
          address: volunteer.detailed_address,
          preferredOffice: volunteer.desired_department,
          isNiqabi: volunteer.is_niqabi,

          // 4️⃣ بيانات الـ TOT والدورات التدريبية (المستوردة من الحصر بالكامل الآن)
          isTotTrainer: volunteer.is_tot_trainer,
          totYear: volunteer.tot_year,
          totCertificateUrl: volunteer.tot_certificate_url,
          otherCertificateUrl: volunteer.other_certificate_url,
          lastFirstAidRefresher: volunteer.last_first_aid_refresher,
          otherPrograms: volunteer.other_programs,

          // 5️⃣ الموقف الميداني وفترات الجاهزية (مستوردة من الحصر)
          currentStatusInKhartoum: volunteer.current_status_in_khartoum,
          expectedReturnTime: volunteer.expected_return_time,
          availabilityLevel: volunteer.availability_level
        }
      });
    } catch (error: any) {
      console.error('Error in getProfileData:', error);
      res.status(500).json({ success: false, message: 'خطأ داخلي في السيرفر', error: error.message });
    }
  }

  // 📥 حفظ وتحديث بيانات الملف الشخصي (مؤمنة ومطورة لكشف أخطاء قاعدة البيانات فوراً)
  async saveProfileData(req: Request, res: Response): Promise<void> {
    try {
      const { userId, ...updateData } = req.body;

      if (!userId) {
        res.status(400).json({ success: false, message: 'معرف المستخدم مطلوب للتحديث' });
        return;
      }

      // 🛡️ تنظيف وقائي للبيانات لمنع تعارض الأنواع مع PostgreSQL
      const cleanData = { ...updateData };
      if (cleanData.birthDate === '') cleanData.birthDate = null;
      if (cleanData.isNiqabi === '' || cleanData.isNiqabi === undefined) cleanData.isNiqabi = null;

      const isUpdated = await model.updateVolunteerProfile(userId, cleanData);

      if (!isUpdated) {
        res.status(400).json({ success: false, message: 'فشل تحديث البيانات، تأكد من صحة البيانات المرسلة ووجود السجل' });
        return;
      }

      res.status(200).json({ success: true, message: 'تم تحديث البيانات الشخصية بنجاح' });
    } catch (error: any) {
      console.error('Error in saveProfileData:', error);
      
      // 🎯 دمج تفاصيل خطأ الـ DB الحقيقي داخل حقل الـ message عشان يظهر في الـ Alert على الموبايل مباشرة
      const dbErrorDetail = error.message || JSON.stringify(error);
      res.status(500).json({ 
        success: false, 
        message: `❌ خطأ في السيرفر أو الـ DB: (${dbErrorDetail})`, 
        error: error.message 
      });
    }
  }
}
