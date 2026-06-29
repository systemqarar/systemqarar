// src/modules/unified-dashboard/volunteer-profile/certificates-cards/certificates-cards.controller.ts

import { Request, Response } from 'express';
import db from '../../../../config/db';

export class CertificatesCardsController {
  
  // 🔍 جلب بيانات البطاقة والشهادات الرقمية بناءً على معرف المستخدم الموحد
  async getCertificatesAndCard(req: Request, res: Response): Promise<void> {
    try {
      const { identifier } = req.params;

      if (!identifier) {
        res.status(400).json({ success: false, message: 'المُعرّف (ID/رقم التطوع) مطلوب' });
        return;
      }

      // الفحص الذكي: هل المدخل UUID الخاص بالمستخدم أم رقم المتطوع الموحد؟
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      const condition = isUuid ? `vp.user_id = $1` : `u.volunteer_number = $1`;

      // استعلام آمن ومتين بجلب الحقول المطلوبة للشهادات والبطاقة فقط
      const query = `
        SELECT 
          vp.user_id,
          u.volunteer_number,
          vp.full_name,
          vp.photo_url,
          vp.admin_position,
          vp.phone,
          vp.created_at AS approved_at,
          vp.is_tot_trainer,
          vp.tot_year,
          vp.tot_certificate_url,
          vp.other_certificate_url,
          vp.last_first_aid_refresher
        FROM volunteer_profiles vp
        INNER JOIN users u ON vp.user_id = u.id
        WHERE ${condition}
      `;

      const result = await db.query(query, [identifier]);
      const volunteer = result.rows[0];

      if (!volunteer) {
        res.status(404).json({ success: false, message: 'لم يتم العثور على سجل الشهادات لهذا المتطوع' });
        return;
      }

      // 🛠️ مواءمة وتصدير البيانات لتطابق الـ interface المتوقع في الـ Hook تماماً
      res.status(200).json({
        success: true,
        data: {
          volunteerId: volunteer.volunteer_number, // المظهر الخارجي للرقم
          fullName: volunteer.full_name,
          profileImageUrl: volunteer.photo_url,
          adminPosition: volunteer.admin_position || 'متطوع ميداني',
          phone: volunteer.phone || '-----------',
          unitName: 'مكتب طوارئ محلية جبل أولياء', // قيمة ثابتة تنظيمية للقطاع الحالي
          approvedAt: volunteer.approved_at,
          isTotTrainer: volunteer.is_tot_trainer,
          totYear: volunteer.tot_year,
          totCertificateUrl: volunteer.tot_certificate_url,
          otherCertificateUrl: volunteer.other_certificate_url,
          lastFirstAidRefresher: volunteer.last_first_aid_refresher
        }
      });

    } catch (error: any) {
      console.error('Error in getCertificatesAndCard:', error);
      res.status(500).json({ success: false, message: 'خطأ داخلي في السيرفر أثناء جلب الوثائق الرقمية' });
    }
  }
}
