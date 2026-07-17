import dbConfig from '../../../../config/db'; // استيراد الكائن الافتراضي المصدّر { pool, query }
import { ICreateLetterInput } from './letters-document.types';

export class LettersDocumentModel {
  
  // 1. دالة لتوليد الرقم المتسلسل التلقائي بناءً على نوع الخطاب والسنة الحالية
  private static async generateSerialNumber(letterType: string): Promise<string> {
    const year = new Date().getFullYear();
    const typePrefix = letterType.substring(0, 4).toUpperCase();
    
    const queryText = `
      SELECT COUNT(*) FROM letters 
      WHERE letter_type = $1 AND EXTRACT(YEAR FROM created_at) = $2
    `;
    // استخدام دالة query المباشرة والمحمية من ملف الإعدادات
    const res = await dbConfig.query(queryText, [letterType, year]);
    const nextNumber = parseInt(res.rows[0].count) + 1;
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    return `QARAR-${year}-${typePrefix}-${paddedNumber}`;
  }

  // 2. دالة إنشاء خطاب جديد وتوزيعه للمستلمين (Database Transaction)
  static async create(senderId: string, input: ICreateLetterInput) {
    // فتح اتصال آمن ومباشر من الـ pool المصدّر رسمياً في ملف db الخاص بك
    const client = await dbConfig.pool.connect(); 
    
    try {
      await client.query('BEGIN'); // بدء المعاملة المحمية

      const serialNumber = await this.generateSerialNumber(input.letter_type);
      
      // التعديل المضمون: إرسال المرفقات كـ Object/Array مباشرة لأن سائق pg يقوم بتحويلها تلقائياً لـ jsonb
      const attachmentsData = input.attachments || []; 

      // إدخال الخطاب في جدول letters الرئيسي مع تمرير الـ status صراحة لمنع قيود الـ NOT NULL
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
        JSON.stringify(attachmentsData), // تمريرها كـ string صريح ليقوم السائق بحقنها داخل حقل الـ jsonb بأمان
        'approved', // إعطاء حالة معتمدة مباشرة لتظهر في صندوق الوارد فوراً بناءً على كود دالة inbox
        input.priority || 'normal',
        input.expires_at || null
      ];
      
      const letterResult = await client.query(letterQuery, letterValues);
      const newLetter = letterResult.rows[0];

      // إدخال المستلمين في جدول letter_recipients
      if (input.recipient_ids && input.recipient_ids.length > 0) {
        const recipientQuery = `
          INSERT INTO letter_recipients (letter_id, recipient_id, is_read)
          VALUES ($1, $2, $3)
        `;
        for (const recipientId of input.recipient_ids) {
          await client.query(recipientQuery, [newLetter.id, recipientId, false]);
        }
      }

      await client.query('COMMIT'); // اعتماد الحفظ النهائي في Neon
      return newLetter;
    } catch (error) {
      await client.query('ROLLBACK'); // التراجع الفوري عند حدوث خطأ
      console.error("🚨 [خطأ حرج في دالة create يمنع الحفظ في قاعدة البيانات]:", error);
      throw error;
    } finally {
      client.release(); // تحرير الكلاينت وإعادته للـ pool
    }
  }

  // 3. دالة استرجاع الخطابات الصادرة مع جلب تفاصيل المستلمين
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
    const res = await dbConfig.query(queryText, [senderId]);
    return res.rows;
  }

  // 4. دالة استرجاع الخطابات الواردة مع جلب اسم المرسل وصفته القيادية بالتوافق مع جداولك الحالية
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
    const res = await dbConfig.query(queryText, [recipientId]);
    return res.rows;
  }
}
