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
          isNiqabi: volunteer.is_niqabi || volunteer.is_niqabi,
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

  // 📥 حفظ وتحديث بيانات الملف الشخصي (Onboarding) مع فحص غيث الصارم ومطابقة الجنس
  async saveProfileData(req: Request, res: Response): Promise<void> {
    try {
      const { userId, ...updateData } = req.body;
console.log(`📥 [فحص قرار الحركي]: تم استقبال طلب حفظ جديد للمستخدم: ${userId} - الساعة: ${new Date().toISOString()}`);

      
      if (!userId) {
        res.status(400).json({ success: false, message: 'معرف المستخدم مطلوب للتحديث' });
        return;
      }

      const cleanData = { ...updateData };
      const originalPhotoUrl = cleanData.profileImageUrl || cleanData.photo_url;
      
      // 👥 سحب حقل الجنس المرفوع من الاستمارة للمطابقة والمخاطبة
      const userGender = cleanData.gender || 'لم يحدد'; 

      const isNiqabiChecked = 
        String(cleanData.isNiqabi) === 'true' || 
        cleanData.isNiqabi === true || 
        String(cleanData.is_niqabi) === 'true' || 
        cleanData.is_ni_qabi === true;

      const shouldApplyNiqabiPrivacy = isNiqabiChecked;

      if (cleanData.isNiqabi !== undefined || cleanData.is_niqabi !== undefined) {
        cleanData.isNiqabi = shouldApplyNiqabiPrivacy;
        cleanData.is_niqabi = shouldApplyNiqabiPrivacy;
      }

      // ==========================================================
      // 🤖 عيون غيث الذكية والمحسنة (فحص جودة الصورة + مطابقة الجنس)
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
            مهمتك الحالية هي فحص جودة وصلاحية الصورة الشخصية المرفوعة من قبل العضو في نظام قرار الإداري لتستخدم في البطاقات والشهادات الرسمية.
            المعايير الصارمة: يجب أن تكون الصورة قريبة من الوجه، متمركزة في المنتصف، وبخلفية لائقة ورسمية. يمنع قبول صور الرحلات، البحار، السلفي، اللقطات الجماعية أو اللقطات العشوائية.
            
            👥 فحص مطابقة الجنس (Gender Matching):
            بناءً على إدخال العضو في الاستمارة، فإن جنسه المحدد هو: (${userGender}).
            يجب عليك التأكد بصرياً من أن ملامح الشخص في الصورة تطابق هذا الجنس تماماً! 
            - إذا كان الجنس المحدد هو "ذكر" والصورة المرفوعة واضحة أنها لـ (أنثى/بت)، ارفض الصورة فوراً.
            - إذا كان الجنس المحدد هو "أنثى" والصورة المرفوعة واضحة أنها لـ (ذكر/ولد)، ارفض الصورة فوراً.
            
            🚨 شرط حاسم وقاطع بخصوص النقاب والوجه:
            حتى لو كانت الأخت منقبة، يجب أن ترفع صورتها بملامح وجهها المكشوفة والكاملة والواضحة تماماً لغرض الفحص والشهادات الرسمية! إذا رفعت صورة ووجهها مغطى بالنقاب أو القماش، يجب أن ترفض الصورة طوالاً (isValid: false).
            في سبب الرفض للمنقبة، وضح لها بلطف شديد وأخوي تالي: (يا أستاذة، نحتاج صورتك بملامح مكشوفة وواضحة عشان تطلع ظابطة وقيافة في الشهادات والبطاقات الرسمية، وما تقلقي نهائياً السيستم ح يغبش ويحجب ملامح الصورة تلقائياً في حسابك عشان خصوصيتك محمية 100%).
            
            🗣️ المخاطبة الموجهة حسب الجنس (Dynamic Phrasing):
            عند صياغة سبب الرفض (reason) في الـ JSON، يجب أن تخاطب العضو لغوياً بناءً على جنسه الممرر (${userGender}):
            - إذا كان ذكراً: خاطبه بصيغة المذكر وبلهجة سودانية محترمة وأخوية ولطيفة (مثال: يا غالي، يا أستاذ، صورتك محتاجة تعديل...).
            - إذا كانت أنثى: خاطبها بصيغة المؤنث وبلهجة سودانية لطيفة ومحترمة وأخوية (مثال: يا غالية، يا أستاذة، صورتكِ محتاجة تعديل...).
          `;

          // 📊 قالب السيليكون الصارم لضبط مخرجات الـ JSON
          const imageValidationSchema = {
            type: "object",
            properties: {
              isValid: { 
                type: "boolean", 
                description: "true للقبول، false للرفض عند عدم المطابقة أو رداءة الصورة" 
              },
              reason: { 
                type: "string", 
                description: "سبب الرفض الموجه جنسياً باللهجة السودانية اللطيفة، أو نص فارغ عند القبول." 
              }
            },
            required: ["isValid", "reason"]
          };

          const ghaithResponseText = await askGhaith(
            "يرجى مراجعة هذه الصورة الشخصية ومطابقتها مع الجنس المحدد وإعطائي القرار النهائي حسب التعليمات السيادية المعطاة لك.",
            {
              responseJson: true,
              responseSchema: imageValidationSchema,
              systemInstruction: ghaithInstruction,
              inlineData: { mimeType, data: base64Image }
            }
          );

          const ghaithResult = JSON.parse(ghaithResponseText);
          
          if (ghaithResult.isValid === false || String(ghaithResult.isValid) === 'false') {
            res.status(400).json({ 
              success: false, 
              message: ghaithResult.reason || 'عذراً، يرجى رفع صورة شخصية رسمية ومطابقة للمواصفات.' 
            });
            return; 
          }

        } catch (ghaithError: any) {
          console.error('🚨 [خطأ فحص غيث]:', ghaithError);
          res.status(400).json({
            success: false,
            message: `🤖 غيث واجه مشكلة أثناء تدقيق الصورة: (${ghaithError.message || 'مشكلة في معالجة الرد'}). يرجى إعادة المحاولة.`
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
          if (cleanData.is_niqabi === false || cleanData.isNiqabi === false) {
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
      res.status(500).json({ 
        success: false, 
        message: `❌ خطأ في السيرفر أو الـ DB: (${error.message || error})`
      });
    }
  }
}
