import { Request, Response } from 'express';
import { OnboardingInputData, UpdateDbPayload } from './onboarding.types';
import { updateVolunteerProfileDb } from './onboarding.models';

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    // التحقق من وجود معرف المستخدم من الـ Middleware الخاص بالحماية
    const userId = req.user?.id; 
    if (!userId) {
      return res.status(401).json({ success: false, message: 'مستخدم غير مصرح له بالدخول' });
    }

    // الالتزام الصارم بالنوع المعتمد في ملف OnboardingInputData من ريكويست البودي
    const input: OnboardingInputData = req.body;

    // دمج العنوان بناءً على حقول المدخلات الصارمة
    const fullAddress = `المنطقة: ${input.main_address} - تفاصيل: ${input.detailed_address}`;

    // تحويل وضمان القيمة المنطقية للنقاب منعاً لأي تضارب حقول
    const isNiqabiChecked = String(input.is_niqabi) === 'true' || input.is_niqabi === true;

    // بروتوكول حماية خصوصية المنقبات الحاسم
    const shouldApplyNiqabiPrivacy = input.gender === 'أنثى' && isNiqabiChecked;

    let finalPublicUrl = input.photo_url || '';         
    let finalSecureUrl = '';  

    if (finalPublicUrl) {
      if (shouldApplyNiqabiPrivacy) {
        // 1️⃣ تأمين النسخة الأصلية النقية في الحقل السري فوراً
        finalSecureUrl = finalPublicUrl;
        
        // 2️⃣ حقن أمر التشويش الصارم في الحقل العام إذا لم يكن محقوناً مسبقاً
        if (finalPublicUrl.includes('/upload/') && !finalPublicUrl.includes('e_blur')) {
          finalPublicUrl = finalPublicUrl.replace('/upload/', '/upload/e_blur:2000/');
        }
      } else {
        // الحسابات العامة (ذكور أو إناث غير منقبات): الرابط العام طبيعي والحقل السري فارغ
        finalPublicUrl = input.photo_url;
        finalSecureUrl = ''; 
      }
    }

    // بناء كائن التحديث المقيد صارماً بنوع UpdateDbPayload لـ Prisma لضمان سلامة الـ Query
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
      is_niqabi: input.gender === 'أنثى' ? isNiqabiChecked : false, 
      photo_url: finalPublicUrl,
      secure_photo_url: finalSecureUrl,
      is_profile_completed: true 
    };

    // تنفيذ التحديث في قاعدة البيانات عبر الموديل المعرف مسبقاً وبشكل آمن
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
