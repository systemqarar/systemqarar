// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.controller.ts

import { Request, Response } from 'express';
import { PersonalDataModel } from './personal-data.models';

const dataModel = new PersonalDataModel();

export class PersonalDataController {
  
  // GET: /api/volunteer/profile/personal-data/:volunteerId
  async getProfileData(req: Request, res: Response) {
    try {
      const { volunteerId } = req.params;
      
      if (!volunteerId) {
        return res.status(400).json({ success: false, message: 'رقم حساب المستخدم مطلوب' });
      }

      const volunteer = await dataModel.findVolunteerById(volunteerId);
      
      if (!volunteer) {
        return res.status(404).json({ success: false, message: 'هذا العضو غير مسجل أو الحساب غير مرتبط' });
      }

      // إرسال البيانات كاملة ومطابقة لما يتوقعه الفرونت إند تماماً
      return res.status(200).json({
        success: true,
        data: {
          volunteerId: volunteer.volunteer_number, 
          fullName: volunteer.full_name,
          nationalId: volunteer.national_id, // هسي حيقرا قيمته الحقيقية والتعليقة حتفك!
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
          profileImageUrl: volunteer.photo_url || volunteer.secure_photo_url, 
          isProfileCompleted: volunteer.is_profile_completed
        }
      });
    } catch (error) {
      console.error('Fetch Profile Error:', error);
      return res.status(500).json({ success: false, message: 'خطأ في سيرفر قرار الداخلي أثناء جلب البيانات' });
    }
  }

  // POST: /api/volunteer/profile/personal-data/update
  async saveProfileData(req: Request, res: Response) {
    try {
      const { volunteerId, ...payload } = req.body;

      if (!volunteerId) {
        return res.status(400).json({ success: false, message: 'رقم الحساب مطلوب لحفظ البيانات' });
      }

      if (!payload.gender || !payload.bloodType || !payload.address) {
        return res.status(400).json({ success: false, message: 'يرجى إكمال الحقول الأساسية المطلوبة' });
      }

      const updated = await dataModel.updateVolunteerProfile(volunteerId, payload);

      if (updated) {
        return res.status(200).json({
          success: true,
          message: 'تم تحديث بياناتك الشخصية بنجاح، وتفعيل حسابك في منظومة قرار! 🎉'
        });
      } else {
        return res.status(404).json({ success: false, message: 'فشل التحديث، الحساب غير موجود' });
      }
    } catch (error) {
      console.error('Update Profile Error:', error);
      return res.status(500).json({ success: false, message: 'فشل حفظ البيانات في نيون DB' });
    }
  }
}
