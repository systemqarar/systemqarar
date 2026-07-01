// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.controller.ts

import { Request, Response } from 'express';
import { PersonalDataModel } from './personal-data.models';

const model = new PersonalDataModel();

export class PersonalDataController {
  
  // 🔍 جلب بيانات الملف الشخصي كاملة (الحصر + قرار) للقراءة
  async getProfileData(req: Request, res: Response): Promise<void> {
    try {
      const { identifier } = req.params;

      if (!identifier) {
        res.status(400).json({ success: false, message: 'المُعرّف مطلوب' });
        return;
      }

      const volunteer = await model.findVolunteerById(identifier);

      if (!volunteer) {
        res.status(404).json({ success: false, message: 'لم يتم العثور على المتطوع' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: volunteer.id,
          userId: volunteer.user_id,
          volunteerNumber: volunteer.volunteer_number,
          nationalId: volunteer.national_id, 
          fullName: volunteer.full_name,
          profileImageUrl: volunteer.photo_url,
          securePhotoUrl: volunteer.secure_photo_url,
          isProfileCompleted: volunteer.is_profile_completed,
          adminPosition: volunteer.admin_position,
          phone: volunteer.phone,
          whatsapp: volunteer.whatsapp,
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
          isTotTrainer: volunteer.is_tot_trainer,
          totYear: volunteer.tot_year,
          totCertificateUrl: volunteer.tot_certificate_url,
          otherCertificateUrl: volunteer.other_certificate_url,
          lastFirstAidRefresher: volunteer.last_first_aid_refresher,
          otherPrograms: volunteer.other_programs,
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

  // 📥 حفظ وتحديث بيانات الملف الشخصي (متوافقة كلياً مع أسماء أعمدة PostgreSQL في نيون)
  async saveProfileData(req: Request, res: Response): Promise<void> {
    try {
      const { userId, ...updateData } = req.body;

      if (!userId) {
        res.status(400).json({ success: false, message: 'معرف المستخدم مطلوب للتحديث' });
        return;
      }

      // 🛡️ دعم الصيغتين (camelCase و snake_case) لضمان مطابقة حقول قاعدة البيانات 100%
      const cleanData = { ...updateData };

      // توحيد استقبال رابط الصورة القادم من الفرونتد
      const originalPhotoUrl = cleanData.profileImageUrl || cleanData.photo_url;

      // 🎯 فحص مرن وصارم لشرط النقاب لضمان عدم التأثر بغياب حقل الجنس أو حسابات الفحص
      const hasNiqabiField = cleanData.isNiqabi !== undefined || cleanData.is_niqabi !== undefined;

      const isNiqabiChecked = 
        String(cleanData.isNiqabi) === 'true' || 
        cleanData.isNiqabi === true || 
        String(cleanData.is_niqabi) === 'true' || 
        cleanData.is_niqabi === true;

      // 🛑 الاعتماد المباشر على الخيار الحماسي المختار
      const shouldApplyNiqabiPrivacy = isNiqabiChecked;

      if (hasNiqabiField) {
        cleanData.isNiqabi = shouldApplyNiqabiPrivacy;
        cleanData.is_niqabi = shouldApplyNiqabiPrivacy;
      }


      if (originalPhotoUrl) {
        if (shouldApplyNiqabiPrivacy) {
          // 1️⃣ تأمين الرابط الأصلي النقي في الحقل السري بالصيغتين
          cleanData.securePhotoUrl = originalPhotoUrl;
          cleanData.secure_photo_url = originalPhotoUrl;
          
          // 2️⃣ صناعة رابط التشويه الخارق (دمج البكسلة والضبابية القصوى)
          if (originalPhotoUrl.includes('/upload/')) {
            // تنظيف الرابط من أي تأثيرات قديمة لمنع التراكم العشوائي للفلاتر
            let rawUrl = originalPhotoUrl.replace(/\/upload\/e_[^/]+\//, '/upload/');
            
            // حقن الفلتر المزدوج النهائي الحاسم لطمس معالم الوجه 100%
            const blurredUrl = rawUrl.replace('/upload/', '/upload/e_pixelate:50,e_blur:2000/');
            
            cleanData.profileImageUrl = blurredUrl;
            cleanData.photo_url = blurredUrl; 
          }
        } else {
          // الحسابات العامة: لا يتم تصفير الحقل السري إلا إذا تم تأكيد إلغاء النقاب صراحةً (تجنباً للتحديث الجزئي)
          if (cleanData.is_niqabi === false || cleanData.isNiqabi === false) {
            cleanData.securePhotoUrl = null;
            cleanData.secure_photo_url = null;
          }
          cleanData.profileImageUrl = originalPhotoUrl;
          cleanData.photo_url = originalPhotoUrl;
        }
      }

      // 🛠️ خريطة حماية إضافية لترجمة بقية الحقول إلى snake_case لضمان حفظها في نيون
      if (cleanData.birthDate !== undefined) cleanData.date_of_birth = cleanData.birthDate === '' ? null : cleanData.birthDate;
      if (cleanData.bloodType !== undefined) cleanData.blood_type = cleanData.bloodType;
      if (cleanData.maritalStatus !== undefined) cleanData.marital_status = cleanData.maritalStatus;
      if (cleanData.education !== undefined) cleanData.education_level = cleanData.education;
      if (cleanData.occupation !== undefined) cleanData.job_title = cleanData.occupation;
      if (cleanData.address !== undefined) cleanData.detailed_address = cleanData.address;
      if (cleanData.preferredOffice !== undefined) cleanData.desired_department = cleanData.preferredOffice;

      // إرسال البيانات المجهزة بالكامل للموديل
      const isUpdated = await model.updateVolunteerProfile(userId, cleanData);

      if (!isUpdated) {
        res.status(400).json({ success: false, message: 'فشل تحديث البيانات، تأكد من صحة المعرف ووجود السجل' });
        return;
      }

      res.status(200).json({ success: true, message: 'تم تحديث البيانات الشخصية بنجاح وضمان الخصوصية الفائقة' });
    } catch (error: any) {
      console.error('Error in saveProfileData:', error);
      const dbErrorDetail = error.message || JSON.stringify(error);
      res.status(500).json({ 
        success: false, 
        message: `❌ خطأ في السيرفر أو الـ DB: (${dbErrorDetail})`, 
        error: error.message 
      });
    }
  }
}
