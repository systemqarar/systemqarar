import { Request, Response } from 'express';
import { saveOrUpdateProfileModel } from './personal-data.models';
import { VolunteerProfileInput } from './personal-data.types';

export const updateProfileController = async (req: Request, res: Response): Promise<any> => {
  try {
    const profileData: VolunteerProfileInput = req.body;
    
    // إرسال البيانات للموديل لتنفيذ الـ UPSERT في Neon
    const updatedProfile = await saveOrUpdateProfileModel(profileData);

    return res.status(200).json({
      success: true,
      message: 'تم تحديث البيانات الشخصية في منظومة قرار بنجاح 🛡️',
      data: updatedProfile
    });
  } catch (error) {
    console.error('خطأ في الـ Controller أثناء حفظ البيانات:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل حفظ البيانات، خطأ في السيرفر الداخلي للوحدة.'
    });
  }
};
