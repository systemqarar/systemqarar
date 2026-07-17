import dbConfig from '../../../../config/db';

export class LettersDocumentModel {
  
  // 1. دالة لتوليد الرقم المتسلسل التلقائي بناءً على نوع الخطاب والسنة الحالية
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

  // 2. دالة إنشاء خطاب جديد وتوزيعه للمستلمين (Database Transaction)
  static async create(senderId: string, input: any) {
    const client = await dbConfig.pool.connect(); 
    
    try {
      await client.query('BEGIN'); // بدء المعاملة المحمية

      const serialNumber = await this.generateSerialNumber(input.letter_type);
      const attachmentsData = input.attachments || []; 

      // إدخال الخطاب في جدول letters الرئيسي
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

      // 🧠 الفلتر الذكي: تجميع كل المصفوفات المحتملة اللي ممكن يرسلها الفرونتد بالخطأ
      const mixedRecipients = [
        ...(input.recipient_ids || []),
        ...(input.recipient_volunteer_numbers || [])
      ];

      const directIds: string[] = [];
      const volunteerNumbers: string[] = [];

      // صيغة التحقق من الـ UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // تصنيف المدخلات بشكل تلقائي وآمن
      mixedRecipients.forEach((item: any) => {
        if (typeof item === 'string') {
          if (uuidRegex.test(item)) {
            directIds.push(item); // إذا كان ID حقيقي نضيفه مباشرة
          } else if (item.trim() !== '') {
            volunteerNumbers.push(item.trim()); // إذا كان رقم متطوع زي SRCS نقوم بعزله للبحث عنه
          }
        }
      });

      // إذا وجدنا أرقام متطوعين، نقوم بتحويلها فوراً داخل قاعدة البيانات إلى IDs حقيقية
      if (volunteerNumbers.length > 0) {
        const userQuery = `
          SELECT user_id FROM volunteer_profiles WHERE volunteer_number = ANY($1)
        `;
        const userResult = await client.query(userQuery, [volunteerNumbers]);
        userResult.rows.forEach((row: any) => directIds.push(row.user_id));
      }

      // تنظيف المصفوفة النهائية من أي تكرار ناتج عن الدمج
      const finalRecipientIds = Array.from(new Set(directIds));

      // إدخال المستلمين النهائيين بمعرفاتهم الصحيحة مية بالمية
      if (finalRecipientIds.length > 0) {
        const recipientQuery = `
          INSERT INTO letter_recipients (letter_id, recipient_id, is_read)
          VALUES ($1, $2, $3)
        `;
        for (const recipientId of finalRecipientIds) {
          await client.query(recipientQuery, [newLetter.id, recipientId, false]);
        }
      } else {
        throw new Error('لم يتم العثور على أي مستخدمين أو متطوعين صالحين بالأرقام الممررة من الفرونتد.');
      }

      await client.query('COMMIT'); // اعتماد الحفظ النهائي في Neon
      return newLetter;
    } catch (error) {
      await client.query('ROLLBACK'); // التراجع الفوري عند حدوث خطأ
      console.error("🚨 [خطأ حرج في دالة create]:", error);
      throw error;
    } finally {
      client.release(); // تحرير الكلاينت
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

  // 4. دالة استرجاع الخطابات الواردة مع جلب اسم المرسل وصفته القيادية
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
