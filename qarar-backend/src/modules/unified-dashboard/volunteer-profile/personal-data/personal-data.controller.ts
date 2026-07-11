// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.controller.ts

import { Request, Response } from 'express';
import { PersonalDataModel } from './personal-data.models';
import { askGhaith } from '../../../../services/ghaithService'; 

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
          adminPosition: volunteer.admin_position_id || volunteer.admin_position || 'متطوع ميداني',
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

  // 📥 حفظ وتحديث بيانات الملف الشخصي مع فحص غيث الصارم
  async saveProfileData(req: Request, res: Response): Promise<void> {
    try {
      const { userId, ...updateData } = req.body;

      if (!userId) {
        res.status(400).json({ success: false, message: 'معرف المستخدم مطلوب للتحديث' });
        return;
      }

      const cleanData = { ...updateData };
      const originalPhotoUrl = cleanData.profileImageUrl || cleanData.photo_url;

      const isNiqabiChecked = 
        String(cleanData.isNiqabi) === 'true' || 
        cleanData.isNiqabi === true || 
        String(cleanData.is_ni_qabi) === 'true' || 
        cleanData.is_ni_qabi === true;

      const shouldApplyNiqabiPrivacy = isNiqabiChecked;

      if (cleanData.isNiqabi !== undefined || cleanData.is_ni_qabi !== undefined) {
        cleanData.isNiqabi = shouldApplyNiqabiPrivacy;
        cleanData.is_ni_qabi = shouldApplyNiqabiPrivacy;
      }

      // ==========================================================
      // 🤖 عيون غيث الذكية والمحسنة (فحص صارم ومقاوم لأخطاء القراءة)
      // ==========================================================
      if (originalPhotoUrl) {
        try {
          const imageResponse = await fetch(originalPhotoUrl);
          
          if (!imageResponse.ok) {
            throw new Error(`تعذر سحب الصورة من السيرفر الوسيط، الرمز: ${imageResponse.status}`);
          }

          const arrayBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

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

          // 🧼 خطوة الحماية المضافة: تنظيف الرد تماماً من أي علامات ماركداون قد يضعها موديول الذكاء الاصطناعي
          let cleanedJsonText = ghaithResponseText.trim();
          if (cleanedJsonText.includes('```')) {
            cleanedJsonText = cleanedJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
          }

          const ghaithResult = JSON.parse(cleanedJsonText);
          
          // تطبيق القرار النهائي الصارم
          if (ghaithResult.isValid === false || String(ghaithResult.isValid) === 'false') {
            res.status(400).json({ 
              success: false, 
              message: ghaithResult.reason || 'عذراً، يرجى رفع صورة شخصية رسمية ومطابقة للمواصفات.' 
            });
            return; // إيقاف فوري وحاسم للحفظ
          }

        } catch (ghaithError: any) {
          console.error('🚨 [خطأ فحص غيث]:', ghaithError);
          
          // 🛑 التعديل الصارم لفترة الفحص والتجريب: نوقف العملية ونظهر الخطأ في المودال بدلاً من التخطي الصامت
          res.status(400).json({
            success: false,
            message: `🤖 غيث واجه مشكلة أثناء التدقيق: (${ghaithError.message || 'مشكلة في معالجة جيسون الرد'}). يرجى إعادة المحاولة أو التأكد من سلامة مفاتيح الـ API الخاص بجيمني.`
          });
          return;
        }
      }

      // ==========================================
      // 🛡️ معالجة خصوصية النقاب (الكود الأصلي المستقر)
      // ==========================================
      if (originalPhotoUrl) {
        if (shouldApplyNiqabiPrivacy) {
          cleanData.securePhotoUrl = originalPhotoUrl;
          cleanData.secure_photo_url = originalPhotoUrl;
          
          if (originalPhotoUrl.includes('/upload/')) {
            let rawUrl = originalPhotoUrl.replace(/\/upload\/e_[^/]+\//, '/upload/');
            const blurredUrl = rawUrl.replace('/upload/', '/upload/e_pixelate:150/e_blur:2000/');
            cleanData.profileImageUrl = blurredUrl;
            cleanData.photo_url = blurredUrl; 
          }
        } else {
          if (cleanData.is_ni_qabi === false || cleanData.isNiqabi === false) {
            cleanData.securePhotoUrl = null;
            cleanData.secure_photo_url = null;
          }
          cleanData.profileImageUrl = originalPhotoUrl;
          cleanData.photo_url = originalPhotoUrl;
        }
      }

      // 🛠️ خريطة حماية وتطابق البيانات مع نيون
      if (cleanData.birthDate !== undefined) cleanData.date_of_birth = cleanData.birthDate === '' ? null : cleanData.birthDate;
      if (cleanData.bloodType !== undefined) cleanData.blood_type = cleanData.bloodType;
      if (cleanData.maritalStatus !== undefined) cleanData.marital_status = cleanData.maritalStatus;
      if (cleanData.education !== undefined) cleanData.education_level = cleanData.education;
      if (cleanData.occupation !== undefined) cleanData.job_title = cleanData.occupation;
      if (cleanData.address !== undefined) cleanData.detailed_address = cleanData.address;
      if (cleanData.preferredOffice !== undefined) cleanData.desired_department = cleanData.preferredOffice;
      if (cleanData.adminPosition !== undefined) cleanData.admin_position_id = cleanData.adminPosition;

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
