import { Request, Response } from 'express';
import { LettersDocumentModel } from './letters-document.models';
import { ICreateLetterInput } from './letters-document.types';
// استدعاء خدماتك الفعلية والمطابقة لمشروعك بالملّي
import { socketService } from '../../../../services/socketService'; 
import { askGhaith } from '../../../../services/ghaithService';

export class LettersDocumentController {

  // 1. إنشاء خطاب رسمي وإرسال التنبيهات الفورية المخصصة للمستلمين عبر السوكت المعدّل
  static async createLetter(req: Request, res: Response) {
    try {
      const senderId = (req as any).user.id; // معرّف المرسل من الـ Auth Middleware
      const input: ICreateLetterInput = req.body;

      if (!input.title || !input.content || !input.letter_type) {
        return res.status(400).json({ success: false, message: 'جميع الحقول الأساسية مطلوبة' });
      }

      // حفظ الخطاب وتوزيعه في قاعدة البيانات عبر الـ Transaction المحمي
      const newLetter = await LettersDocumentModel.create(senderId, input);

      // إرسال تنبيه فوري مخصص لكل مستلم تم تحديده في مصفوفة المستلمين
      if (input.recipient_ids && input.recipient_ids.length > 0) {
        input.recipient_ids.forEach((recipientId) => {
          socketService.sendNotificationToUser(recipientId, {
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
      const recipientId = (req as any).user.id;
      const letters = await LettersDocumentModel.getInboxLetters(recipientId);
      return res.status(200).json({ success: true, data: letters });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // 4. جلب الخطابات الصادرة من المستخدم الحالي (صندوق الصادر)
  static async getSent(req: Request, res: Response) {
    try {
      const senderId = (req as any).user.id;
      const letters = await LettersDocumentModel.getSentLetters(senderId);
      return res.status(200).json({ success: true, data: letters });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
