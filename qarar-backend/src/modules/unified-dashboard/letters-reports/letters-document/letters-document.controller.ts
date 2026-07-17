import { Request, Response } from 'express';
import { LettersDocumentModel } from './letters-document.models';
// استدعاء خدماتك الفعلية والمطابقة لمشروعك بالملّي
import { socketService } from '../../../../services/socketService'; 
import { askGhaith } from '../../../../services/ghaithService';
import dbConfig from '../../../../config/db'; // استيراد الـ db لجلب الـ IDs للتنبيهات الفورية إذا لزم الأمر

export class LettersDocumentController {

  // 1. إنشاء خطاب رسمي وإرسال التنبيهات الفورية المخصصة للمستلمين عبر أرقام المتطوعين
  static async createLetter(req: Request, res: Response) {
    try {
      // 🔑 التقط المعرف بشكل آمن يتوافق مع الـ JWT المعتمد في نظامك
      const userPayload = (req as any).user;
      const senderId = userPayload?.userId || userPayload?.id || (req as any).userId;

      if (!senderId) {
        return res.status(401).json({ 
          success: false, 
          message: 'عذراً، لم يتم التعرف على هوية المستخدم الصادر. تأكد من إرسال توكن صلاحية صالح.' 
        });
      }

      const input = req.body;

      if (!input.title || !input.content || !input.letter_type) {
        return res.status(400).json({ success: false, message: 'جميع الحقول الأساسية مطلوبة' });
      }

      // حفظ الخطاب وتوزيعه في قاعدة البيانات عبر الـ Transaction المحمي باستخدام رقم المتطوع
      const newLetter = await LettersDocumentModel.create(senderId, input);

      // 🔔 إرسال تنبيه فوري مخصص عبر السوكت عن طريق جلب الـ IDs الحقيقية لأرقام المتطوعين الممررة
      if (input.recipient_volunteer_numbers && input.recipient_volunteer_numbers.length > 0) {
        const userQuery = `SELECT user_id FROM volunteer_profiles WHERE volunteer_number = ANY($1)`;
        const userResult = await dbConfig.query(userQuery, [input.recipient_volunteer_numbers]);
        
        userResult.rows.forEach((row: any) => {
          socketService.sendNotificationToUser(row.user_id, {
            type: 'LETTER',
            title: 'خطاب رسمي جديد',
            message: `وصلك خطاب جديد بعنوان: ${input.title}`,
            letter_id: newLetter.id,
            priority: input.priority || 'normal'
          });
        });
      }

      return res.status(201).json({ success: true, data: newLetter });
    } catch (error: any) {
      console.error("🚨 [خطأ في كونترولر الخطابات]:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // 2. محرك المساعد الرقمي (غيث) المعتمد في نظام قرار لصياغة الخطابات الرسمية
  static async generateAIDraft(req: Request, res: Response) {
    try {
      const { userPrompt, letterType } = req.body;

      if (!userPrompt || !letterType) {
        return res.status(400).json({ success: false, message: 'النص البدئي ونوع الخطاب مطلوبان' });
      }

      // هندسة الأوامر (Prompt Engineering) متوافقة تماماً مع دور غيث في الهلال الأحمر
      const systemContext = `
        نوع الخطاب المطلوب حالياً هو: (${letterType}).
        يجب أن يحتوي الخطاب على مقدمة رسمية، عرض للموضوع بوضوح شديد وبدون إطالة غير مفيدة، وخاتمة إدارية راقية تتناسب مع سياق العمل الإنساني للهلال الأحمر السوداني.
        اكتب النص الصافي والمصاغ للخطاب فقط بدون أي هوامش، تحيات خارجية، أو تفسيرات جانبية.
      `;

      // الاستدعاء الحقيقي والدقيق لخدمة غيث المركزية في نظامك
      const draftedContent = await askGhaith(userPrompt, {
        systemInstruction: systemContext
      });

      return res.status(200).json({ success: true, draftedContent });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // 3. جلب الخطابات الواردة للمستخدم الحالي (صندوق الوارد)
  static async getInbox(req: Request, res: Response) {
    try {
      const userPayload = (req as any).user;
      const recipientId = userPayload?.userId || userPayload?.id || (req as any).userId;

      const letters = await LettersDocumentModel.getInboxLetters(recipientId);
      return res.status(200).json({ success: true, data: letters });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // 4. جلب الخطابات الصادرة من المستخدم الحالي (صندوق الصادر)
  static async getSent(req: Request, res: Response) {
    try {
      const userPayload = (req as any).user;
      const senderId = userPayload?.userId || userPayload?.id || (req as any).userId;

      const letters = await LettersDocumentModel.getSentLetters(senderId);
      return res.status(200).json({ success: true, data: letters });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
