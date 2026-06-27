import { Request, Response } from 'express';
import { saveOrUpdateProfileModel, getProfileFromDBModel } from './personal-data.models';
import { VolunteerProfileInput } from './personal-data.types';

/**
 * 📥 1. دالة حفظ وتحديث البيانات الشخصية (UPSERT)
 */
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

/**
 * 📤 2. دالة جلب وقراءة البيانات الحقيقية برقم العضوية
 */
export const getProfileController = async (req: Request, res: Response): Promise<any> => {
  try {
    const { volunteerId } = req.params; // لقط رقم العضوية الحقيقي القادم من رابط الواجهات
    
    // استدعاء قاعدة البيانات لجلب الملف
    const profile = await getProfileFromDBModel(volunteerId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على بيانات لهذا المتطوع في منظومة قرار.'
      });
    }

    // إرجاع البيانات الحقيقية للواجهة
    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('خطأ في الـ Controller أثناء جلب البيانات:', error);
    return res.status(500).json({
      success: false,
      message: 'فشل جلب البيانات، خطأ في السيرفر الداخلي للوحدة.'
    });
  }
};
