import { Request, Response } from 'express';
import db from '../../../../config/db';
import { hasrApiClient } from '../../../../services/hasrApiClient';

export const registrationExceptionsController = {
  
  // 1️⃣ البحث عن المتطوع في نظام الحصر الرسمي قبل إضافته
  searchInHasr: async (req: Request, res: Response): Promise<void> => {
    try {
      const { volunteer_number } = req.params;

      if (!volunteer_number) {
        res.status(400).json({ error: 'الرجاء إدخال رقم المتطوع' });
        return;
      }

      // استدعاء نظام الحصر الفعلي الموجود مسبقاً في سيرفرك
      const volunteerData = await hasrApiClient.getVolunteerById(volunteer_number);

      if (!volunteerData) {
        res.status(404).json({ error: 'هذا الرقم غير موجود في نظام الحصر الرسمي' });
        return;
      }

      // إرسال البيانات للفرونتد عشان يعرض كارت المعاينة السميح
      res.status(200).json({
        volunteer_number: volunteerData.volunteerId || volunteerData.volunteer_number,
        full_name: volunteerData.fullName || volunteerData.full_name,
        photo_url: volunteerData.photoUrl || volunteerData.photo_url || null,
        unit_name: volunteerData.unitName || volunteerData.unit_name || 'وحدة غير معرفة'
      });
    } catch (error: any) {
      console.error('Error searching in Hasr:', error);
      res.status(500).json({ error: error.message || 'خطأ أثناء الاتصال بنظام الحصر الحركي' });
    }
  },

  // 2️⃣ اعتماد وتأكيد إضافة العضو المستثنى وحفظ بياناته مع ملاحظتك الشخصية
  createException: async (req: Request, res: Response): Promise<void> => {
    try {
      const { volunteer_number, full_name, photo_url, unit_name, notes } = req.body;

      if (!volunteer_number || !full_name) {
        res.status(400).json({ error: 'البيانات الأساسية غير مكتملة' });
        return;
      }

      // منع تكرار إضافة نفس الشخص في قائمة الاستثناءات
      const existingCheck = await db.query(
        'SELECT id FROM registration_exceptions WHERE LOWER(TRIM(volunteer_number)) = LOWER(TRIM($1))',
        [volunteer_number]
      );

      if (existingCheck.rows.length > 0) {
        res.status(400).json({ error: 'هذا المتطوع مضاف مسبقاً في قائمة المستثنيين' });
        return;
      }

      const insertQuery = `
        INSERT INTO registration_exceptions (volunteer_number, full_name, photo_url, unit_name, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;
      
      await db.query(insertQuery, [volunteer_number, full_name, photo_url, unit_name, notes || null]);

      res.status(201).json({ message: 'تم اعتماد العضو في قائمة الاستثناءات بنجاح تام' });
    } catch (error) {
      console.error('Error creating exception:', error);
      res.status(500).json({ error: 'فشل حفظ العضو المستثنى في السيرفر' });
    }
  },

  // 3️⃣ جلب قائمة المستثنيين بالكامل + الفحص الذكي (هل سجل فعلياً في قرار أم لسه)
  getExceptionsList: async (req: Request, res: Response): Promise<void> => {
    try {
      // استعلام ذكي يربط جدول الاستثناءات بجدول المستخدمين لمعرفة الحالة تلقائياً
      const queryText = `
        SELECT 
          e.id,
          e.volunteer_number,
          e.full_name,
          e.photo_url,
          e.unit_name,
          e.notes,
          e.created_at,
          CASE 
            WHEN u.id IS NULL THEN false
            ELSE true
          END as has_registered
        FROM registration_exceptions e
        LEFT JOIN users u ON LOWER(TRIM(u.volunteer_number)) = LOWER(TRIM(e.volunteer_number))
        ORDER BY e.created_at DESC;
      `;

      const result = await db.query(queryText);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching exceptions list:', error);
      res.status(500).json({ error: 'خطأ داخلي أثناء جلب قائمة الاستثناءات' });
    }
  },

  // 4️⃣ حذف العضو من الاستثناءات فقط (بدون قفل أو حذف حسابه لو كان مسجل)
  deleteException: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deleteResult = await db.query('DELETE FROM registration_exceptions WHERE id = $1 RETURNING id', [id]);

      if (deleteResult.rows.length === 0) {
        res.status(404).json({ error: 'العضو غير موجود أو تم حذفه مسبقاً' });
        return;
      }

      res.status(200).json({ message: 'تم استبعاد العضو من قائمة الاستثناءات بنجاح دون المساس بحسابه العام' });
    } catch (error) {
      console.error('Error deleting exception:', error);
      res.status(500).json({ error: 'فشل عملية استبعاد العضو من السيرفر' });
    }
  }
};
