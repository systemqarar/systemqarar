// src/modules/unified-dashboard/volunteer-profile/onboarding/onboarding.controller.ts

import { Request, Response } from 'express';
import { OnboardingInputData, UpdateDbPayload } from './onboarding.types';
import { updateVolunteerProfileDb } from './onboarding.models';

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; 
    if (!userId) {
      return res.status(401).json({ success: false, message: 'مستخدم غير مصرح له بالدخول' });
    }

    const input: OnboardingInputData = req.body;

    const fullAddress = `المنطقة: ${input.main_address} - تفاصيل: ${input.detailed_address}`;

    // 🎯 تحويل ذكي وصارم لقيمة النقاب لضمان عدم تمريرها بشكل خاطئ كـ String
    const isNiqabiChecked = String(input.is_niqabi) === 'true' || input.is_niqabi === true;

    // التحقق مما إذا كان الحساب يخص متطوعة منقبة لتطبيق بروتوكول الخصوصية
    const shouldApplyNiqabiPrivacy = input.gender === 'أنثى' && isNiqabiChecked;

    // تجهيز متغيرات الروابط لمعالجتها
    let finalPublicUrl = input.photo_url || '';         
    let finalSecureUrl = input.secure_photo_url || '';  

    if (shouldApplyNiqabiPrivacy && finalPublicUrl) {
      // 1️⃣ الصورة الأصلية الحقيقية يتم نقلها فوراً وتأمينها داخل حقل الصورة السرية
      finalSecureUrl = finalPublicUrl;
      
      // 2️⃣ الصورة العامة يتم حقنها بأمر التشويش الصارم من كلاودنري (تصبح مشوشة تماماً تلقائياً)
      if (finalPublicUrl.includes('/upload/')) {
        finalPublicUrl = finalPublicUrl.replace('/upload/', '/upload/e_blur:2000/');
      }
    }

    const dbPayload: UpdateDbPayload = {
      gender: input.gender,
      date_of_birth: new Date(input.date_of_birth), 
      marital_status: input.marital_status,
      blood_type: input.blood_type,
      email: input.email,
      education_level: input.education_level,
      job_title: input.job_title,
      detailed_address: fullAddress,
      desired_department: input.desired_department, 
      is_niqabi: input.gender === 'أنثى' ? isNiqabiChecked : false, // الحماية الصارمة
      photo_url: finalPublicUrl,
      secure_photo_url: finalSecureUrl,
      is_profile_completed: true 
    };

    await updateVolunteerProfileDb(userId, dbPayload);

    return res.status(200).json({
      success: true,
      message: 'تم تفعيل حسابك بنجاح، ومزامنة بياناتك في نظام قرار الإداري!'
    });

  } catch (error) {
    console.error('Onboarding Controller Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ داخلي في السيرفر أثناء معالجة وحفظ بيانات قرار' 
    });
  }
};
