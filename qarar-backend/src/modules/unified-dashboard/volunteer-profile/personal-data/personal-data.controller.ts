// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.controller.ts

import { Request, Response } from 'express';
import { PersonalDataModel } from './personal-data.models';

const model = new PersonalDataModel();

export class PersonalDataController {
  
  // 🔍 جلب بيانات الملف الشخصي
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

      // إرجاع البيانات في قالب JSON نظيف ومفهوم للفرونت إند
      res.status(200).json({
        success: true,
        data: {
          id: volunteer.id,
          userId: volunteer.user_id,
          volunteerNumber: volunteer.volunteer_number,
          nationalId: volunteer.national_id, // الحقل الجديد المجلوب من جدول users
          fullName: volunteer.full_name,
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
          profileImageUrl: volunteer.photo_url,
          securePhotoUrl: volunteer.secure_photo_url,
          adminPosition: volunteer.admin_position,
          isProfileCompleted: volunteer.is_profile_completed
        }
      });
    } catch (error: any) {
      console.error('Error in getProfileData:', error);
      res.status(500).json({ success: false, message: 'خطأ داخلي في السيرفر', error: error.message });
    }
  }

  // 📥 حفظ وتحديث بيانات الملف الشخصي
  async saveProfileData(req: Request, res: Response): Promise<void> {
    try {
      const { userId, ...updateData } = req.body;

      if (!userId) {
        res.status(400).json({ success: false, message: 'معرف المستخدم مطلوب للتحديث' });
        return;
      }

      const isUpdated = await model.updateVolunteerProfile(userId, updateData);

      if (!isUpdated) {
        res.status(400).json({ success: false, message: 'فشل تحديث البيانات، تأكد من صحة البيانات المرسلة' });
        return;
      }

      res.status(200).json({ success: true, message: 'تم تحديث البيانات الشخصية بنجاح' });
    } catch (error: any) {
      console.error('Error in saveProfileData:', error);
      res.status(500).json({ success: false, message: 'خطأ داخلي أثناء تحديث البيانات', error: error.message });
    }
  }
}
