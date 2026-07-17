import dbConfig from '../../../../config/db';
import { ICreateLetterInput } from './letters-document.types';

export class LettersDocumentModel {
  
  // دالة توليد الرقم المتسلسل التلقائي للخطاب
  private static async generateSerialNumber(letterType: string): Promise<string> {
    const year = new Date().getFullYear();
    const typePrefix = letterType.substring(0, 4).toUpperCase();
    
    const queryText = `
      SELECT COUNT(*) FROM letters 
      WHERE letter_type = $1 AND EXTRACT(YEAR FROM created_at) = $2
    `;
    const res = await dbConfig.query(queryText, [letterType, year]);
    const nextNumber = parseInt(res.rows[0].count) + 1;
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    return `QARAR-${year}-${typePrefix}-${paddedNumber}`;
  }

  // إنشاء الخطاب والتحويل التلقائي لأرقام المتطوعين إلى معرفات نظام
  static async create(senderId: string, input: any) {
    const client = await dbConfig.pool.connect(); 
    
    try {
      await client.query('BEGIN');

      const serialNumber = await this.generateSerialNumber(input.letter_type);
      const attachmentsData = input.attachments || []; 

      // 1. إدخال الخطاب الرئيسي في جدول letters
      const letterQuery = `
        INSERT INTO letters (serial_number, sender_id, letter_type, title, content, attachments, status, priority, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const letterValues = [
        serialNumber,
        senderId,
        input.letter_type,
        input.title,
        input.content,
        JSON.stringify(attachmentsData),
        'approved', 
        input.priority || 'normal',
        input.expires_at || null
      ];
      
      const letterResult = await client.query(letterQuery, letterValues);
      const newLetter = letterResult.rows[0];

      // 2. جلب الـ UUIDs الحقيقية للمستلمين بناءً على الـ volunteer_numbers
      if (input.recipient_volunteer_numbers && input.recipient_volunteer_numbers.length > 0) {
        
        // جلب الـ user_id من جدول volunteer_profiles المطابق لأرقام المتطوعين
        const userQuery = `
          SELECT user_id FROM volunteer_profiles WHERE volunteer_number = ANY($1)
        `;
        const userResult = await client.query(userQuery, [input.recipient_volunteer_numbers]);
        const recipientIds = userResult.rows.map(row => row.user_id);

        if (recipientIds.length > 0) {
          const recipientQuery = `
            INSERT INTO letter_recipients (letter_id, recipient_id, is_read)
            VALUES ($1, $2, $3)
          `;
          for (const recipientId of recipientIds) {
            await client.query(recipientQuery, [newLetter.id, recipientId, false]);
          }
        } else {
          throw new Error('لم يتم العثور على أي متطوعين صالحين بالأرقام الممررة.');
        }
      }

      await client.query('COMMIT');
      return newLetter;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("🚨 [خطأ حرج في الـ Transaction لجذر المشكلة]:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // بقية الدوال (getSentLetters, getInboxLetters) تظل كما هي دون تغيير
}
