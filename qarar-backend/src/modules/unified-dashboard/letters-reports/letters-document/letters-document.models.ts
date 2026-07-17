import db from '../../../../config/db';
import { ICreateLetterInput, LetterStatus } from './letters-document.types';

export class LettersDocumentModel {
  
  // 1. دالة لتوليد الرقم المتسلسل الذكي والتلقائي بناءً على نوع الخطاب والسنة الحالية
  private static async generateSerialNumber(letterType: string): Promise<string> {
    const year = new Date().getFullYear();
    const typePrefix = letterType.substring(0, 4).toUpperCase();
    
    // حساب عدد الخطابات من نفس النوع في السنة الحالية لتوليد الرقم المتسلسل
    const queryText = `
      SELECT COUNT(*) FROM letters 
      WHERE letter_type = $1 AND EXTRACT(YEAR FROM created_at) = $2
    `;
    const res = await db.query(queryText, [letterType, year]);
    const nextNumber = parseInt(res.rows[0].count) + 1;
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    return `QARAR-${year}-${typePrefix}-${paddedNumber}`;
  }

  // 2. دالة إنشاء خطاب جديد وتوزيعه للمستلمين (Database Transaction)
  static async create(senderId: string, input: ICreateLetterInput) {
    // 🏛️ التعديل المؤسسي المضمون: سحب الكلاينت عبر دالة الـ connect المباشرة المتاحة في كائن الـ db أو الـ pool الخاص بك
    // إذا واجهتك مشكلة هنا، فالحل هو استدعاء db.connect() مباشرة دون استخدام كلمة pool
    const client = await (db.connect ? db.connect() : (db as any).pool.connect()); 
    
    try {
      await client.query('BEGIN'); // بدء العملية المحمية

      const serialNumber = await this.generateSerialNumber(input.letter_type);
      const attachmentsJson = JSON.stringify(input.attachments || []);

      // إدخال الخطاب في جدول letters الرئيسي
      const letterQuery = `
        INSERT INTO letters (serial_number, sender_id, letter_type, title, content, attachments, priority, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const letterValues = [
        serialNumber,
        senderId,
        input.letter_type,
        input.title,
        input.content,
        attachmentsJson,
        input.priority || 'normal',
        input.expires_at || null
      ];
      
      const letterResult = await client.query(letterQuery, letterValues);
      const newLetter = letterResult.rows[0];

      // إدخال المستلمين في جدول letter_recipients (المرونة الإدارية المخصصة)
      if (input.recipient_ids && input.recipient_ids.length > 0) {
        const recipientQuery = `
          INSERT INTO letter_recipients (letter_id, recipient_id)
          VALUES ($1, $2)
        `;
        for (const recipientId of input.recipient_ids) {
          await client.query(recipientQuery, [newLetter.id, recipientId]);
        }
      }

      await client.query('COMMIT'); // اعتماد الحفظ النهائي في قاعدة البيانات
      return newLetter;
    } catch (error) {
      await client.query('ROLLBACK'); // إلغاء كل شيء في حال حدوث أي خطأ لمنع العشوائية
      throw error;
    } finally {
      client.release(); // تحرير الكلاينت وإعادته للـ Pool بأمان
    }
  }

  // 3. دالة استرجاع الخطابات الصادرة (التي كتبها المستخدم الحالي) مع جلب أسماء المستلمين
  static async getSentLetters(senderId: string) {
    const queryText = `
      SELECT l.*, 
             COALESCE(json_agg(json_build_object('recipient_id', lr.recipient_id, 'is_read', lr.is_read)) FILTER (WHERE lr.id IS NOT NULL), '[]') as recipients
      FROM letters l
      LEFT JOIN letter_recipients lr ON l.id = lr.letter_id
      WHERE l.sender_id = $1
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `;
    const res = await db.query(queryText, [senderId]);
    return res.rows;
  }

  // 4. دالة استرجاع الخطابات الواردة (التي أُرسلت للمستخدم الحالي) مع جلب اسم المرسل وصفته تلقائياً بـ JOIN
  static async getInboxLetters(recipientId: string) {
    const queryText = `
      SELECT l.*, lr.is_read, lr.read_at,
             vp.full_name as sender_name,
             ap.position_name_ar as sender_position
      FROM letter_recipients lr
      JOIN letters l ON lr.letter_id = l.id
      JOIN volunteer_profiles vp ON l.sender_id = vp.user_id
      LEFT JOIN admin_positions ap ON vp.admin_position_id = ap.id
      WHERE lr.recipient_id = $1 AND l.status = 'approved'
      ORDER BY l.created_at DESC
    `;
    const res = await db.query(queryText, [recipientId]);
    return res.rows;
  }
}
