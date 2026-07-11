// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.controller.ts

import { Request, Response } from 'express';
import { PersonalDataModel } from './personal-data.models';
import { askGhaith } from '../../../../services/ghaithService'; // 👈 استدعاء خدمة غيث المركزية المطورة بدقة

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
          // 🛡️ تأمين القراءة: دعم الحقل الجديد والقديم تجنباً لأي كراش في السيرفر
          adminPosition: volunteer.admin_position_id || volunteer.admin_position || 'متطوع ميداني',
          // 🎯 إضافة ذكية: تمرير اسم الوحدة للفرونتد ليعرض في شاشة البيانات الشخصية برضه
          unitName: volunteer.unit_name || 'وحدة الكلاكلة شرق الإدارية',
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

      // ==========================================================
      // 🤖 عيون غيث الذكية: فحص جودة وصلاحية الصورة الشخصية لـ قرار
      // ==========================================================
      if (originalPhotoUrl) {
        try {
          // 1. سحب ملف الصورة المرفوع في كلاودنري لتحويله إلى صيغة يفهمها جيمني
          const imageResponse = await fetch(originalPhotoUrl);
          if (imageResponse.ok) {
            const arrayBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString('base64');
            const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

            // 2. صياغة التعليمات الصارمة لغيث مع ضبط اللهجة والروح السودانية
            const ghaithInstruction = `
              مهمتك الحالية هي فحص جودة وصلاحية الصورة الشخصية المرفوعة من قبل العضو في نظام قرار الإداري.
              المعايير الصارمة: يجب أن تكون الصورة قريبة من الوجه، متمركزة في المنتصف، وبخلفية لائقة ورسمية تليق بالبطاقات التعريفية والشهادات الرسمية. يمنع منعاً باتاً قبول صور الرحلات، البحار، الصور العائلية الجماعية، أو الصور غير اللائقة إدارياً.
              
              ⚠️ تنبيه أمان فائق بخصوص النقاب: حالة النقاب لهذا الحساب حالياً هي (${shouldApplyNiqabiPrivacy ? 'منقبة واختارت حماية الخصوصية' : 'غير منقبة'}). إذا كانت الحالة منقبة، فمن الطبيعي والمحترم جداً أن يكون الوجه مغطى بالنقاب! لا ترفض الصورة بحجة عدم وضوح الوجه، بل تأكد فقط أن الصورة رسمية، متمركزة، رصينة، وليست لقطة عشوائية مكركبة في مكان عام.
              
              شروط الرد: يجب أن ترد بصيغة JSON حصراً كالتالي دون أي نص خارجي أو تحيات إضافية:
              { "isValid": true أو false, "reason": "اكتب النص هنا في حال الرفض" }
              
              طريقة صياغة سبب الرفض (عندما تكون isValid هي false): اكتب السبب باللهجة السودانية الخالصة، بأسلوب مهذب ومحترم ولطيف جداً وأخوي، يحسس العضو بمكانته الكبيرة وأهميته في نظام قرار، ويوضح له بلطف أننا نحتاج صورة ضابطة ومسطرة عشان تطلع قيافة وممتازة في البطاقات أو الشهادات الرسمية الخاصة به.
            `;

            const ghaithResponseText = await askGhaith(
              "يرجى مراجعة هذه الصورة الشخصية وإعطائي القرار النهائي بملف JSON حسب التعليمات السيادية المعطاة لك.",
              {
                responseJson: true,
                systemInstruction: ghaithInstruction,
                inlineData: { mimeType, data: base64Image }
              }
            );

            // 3. تحليل الرد برمجياً واتخاذ القرار الحاسم
            const ghaithResult = JSON.parse(ghaithResponseText);
            
            if (ghaithResult.isValid === false || String(ghaithResult.isValid) === 'false') {
              // لو غيث رفض الصورة، السيرفر بيقيف ويرجع رسالة غيث اللطيفة لتعرض في النافذة المنبثقة
              res.status(400).json({ 
                success: false, 
                message: ghaithResult.reason || 'عذراً، يرجى رفع صورة شخصية رسمية ومطابقة للمواصفات.' 
              });
              return;
            }
          }
        } catch (ghaithError) {
          // 🛡️ استراتيجية الحماية الفائقة ضد الكراش: لو مفاتيح جيمني خلصت أو الإنترنت علق، لا نعطل السيرفر
          console.error('🚨 تنبيه: حدث خطأ أثناء فحص غيث للصورة، تم تمرير الطلب حماية لسير العمل:', ghaithError);
        }
      }

      // ==========================================
      // 🛡️ معالجة خصوصية النقاب (الكود الأصلي بدون أي تغيير)
      // ==========================================
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
            const blurredUrl = rawUrl.replace('/upload/', '/upload/e_pixelate:150/e_blur:2000/');
            
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
      
      // ⚡ تدارك حاسم: ترجمة وتأمين حقل المنصب الإداري عند الحفظ والتحديث في نيون
      if (cleanData.adminPosition !== undefined) cleanData.admin_position_id = cleanData.adminPosition;

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
