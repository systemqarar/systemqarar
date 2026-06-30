// src/modules/unified-dashboard/volunteer-profile/onboarding/onboarding.controller.ts

import { Request, Response } from 'express';
import { OnboardingInputData, UpdateDbPayload } from './onboarding.types';
import { updateVolunteerProfileDb } from './onboarding.models';
// 🏆 استدعاء الخدمة المركزية الجديدة من مجلد الخدمات بجانب الحصر والواتساب
import { uploadProfileImage } from '../../../../services/cloudinaryService';

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    // 1. جلب الـ ID الحقيقي للمستخدم من جلسة التشفير والأمان (Auth Session)
    const userId = req.user?.id; 
    if (!userId) {
      return res.status(401).json({ success: false, message: 'مستخدم غير مصرح له بالدخول' });
    }

    const input: OnboardingInputData = req.body;

    // 2. دمج المنطقة والتفاصيل في حقل السكن المعتمد الفعلي في جدولك (detailed_address)
    const fullAddress = `المنطقة: ${input.main_address} - تفاصيل: ${input.detailed_address}`;

    let finalPublicUrl = '';
    let finalSecureUrl = '';

    // 3. كود الرفع السحابي الذكي والنظيف عبر السيرفس المركزية
    if (input.photo_url) {
      // نرسل الصورة والنوع وحالة النقاب للخدمة وهي تتولى التشفير والتشويه تلقائياً
      const uploadResult = await uploadProfileImage(input.photo_url, input.gender, input.is_niqabi);
      
      finalPublicUrl = uploadResult.photo_url;         // الرابط العام (المشوش للمنقبات أو الطبيعي للعامة)
      finalSecureUrl = uploadResult.secure_photo_url;  // الرابط الصافي المؤمن للشهادات الإدارية
    }

    // 4. تجهيز الحمولة النهائية بالمسميات الرسمية لجدول volunteer_profiles
    const dbPayload: UpdateDbPayload = {
      gender: input.gender,
      date_of_birth: new Date(input.date_of_birth), // تحويل النص التاريخي إلى صيغة Date للداتابيز
      marital_status: input.marital_status,
      blood_type: input.blood_type,
      email: input.email,
      education_level: input.education_level,
      job_title: input.job_title,
      detailed_address: fullAddress,
      desired_department: input.desired_department, // نظام المكاتب السبعة الإدارية
      is_niqabi: input.gender === 'أنثى' ? input.is_niqabi : false, // حماية منطقية ضد الإدخال الخاطئ للذكور
      photo_url: finalPublicUrl,
      secure_photo_url: finalSecureUrl,
      is_profile_completed: true // تفعيل الحساب لفتح لوحة التحكم الذكية للمتطوع
    };

    // 5. الحفظ النهائي في قاعدة بيانات Neon عبر الموديل المعزول
    await updateVolunteerProfileDb(userId, dbPayload);

    // 6. استجابة النجاح الرسمية للمنظومة
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
