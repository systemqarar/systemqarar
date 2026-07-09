import { Request, Response } from 'express';
import { ExecutiveBoardModel } from './executive-board.models'; // الربط بالموديل الذكي والمؤمن

export const ExecutiveBoardController = {
  
  // 1. جلب بيانات الهيكل الإداري والمتطوعين المتاحين عند فتح الشاشة
  getBoardData: async (req: Request, res: Response) => {
    try {
      // استدعاء الموديل المؤمن لجلب البيانات الصحيحة بالـ JOIN والـ UUID
      const currentBoard = await ExecutiveBoardModel.getCurrentBoard();
      const availableVolunteers = await ExecutiveBoardModel.getAvailableVolunteers();

      return res.status(200).json({
        success: true,
        data: {
          currentBoard,
          availableVolunteers
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب بيانات الهيكل الإداري',
        error: error.message
      });
    }
  },

  // 2. إرسال طلب تعيين منصب جديد لمتطوع (تحديث البروفايل والحساب معاً)
  assignVolunteer: async (req: Request, res: Response) => {
    const { volunteerNumber, position } = req.body;

    if (!volunteerNumber || !position) {
      return res.status(400).json({ success: false, message: 'بيانات التعيين غير مكتملة' });
    }

    try {
      // تمرير المهمة للموديل ليفجر الـ Transaction ويحدث الجدولين (users و volunteer_profiles) في ثانية واحدة
      const result = await ExecutiveBoardModel.assignPosition(volunteerNumber, position);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'فشل السيرفر في إتمام عملية التعيين'
      });
    }
  },

  // 3. إرسال طلب إعفاء عضو وإعادته لمرتبة متطوع عادي
  exemptVolunteer: async (req: Request, res: Response) => {
    const { volunteerNumber } = req.body;

    if (!volunteerNumber) {
      return res.status(400).json({ success: false, message: 'رقم المتطوع مطلوب لإتمام الإعفاء' });
    }

    try {
      // تمرير طلب الإعفاء النظيف للموديل
      const result = await ExecutiveBoardModel.exemptPosition(volunteerNumber);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ في السيرفر أثناء محاولة الإعفاء'
      });
    }
  }
};
