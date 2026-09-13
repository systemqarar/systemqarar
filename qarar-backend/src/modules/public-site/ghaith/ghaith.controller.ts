import { Request, Response } from 'express';
import { askGhaith } from '../../../services/ghaithService';
import { query } from '../../../config/db'; // الاستيراد الصحيح المباشر لدالة query

export const handleGhaithChat = async (req: Request, res: Response) => {
  try {
    const { prompt, sessionId } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'الرجاء كتابة النص أولاً' });
    }

    let currentSessionId = sessionId;

    // 1. إنشاء جلسة جديدة في حال لم يتم إرسال sessionId (أول رسالة)
    if (!currentSessionId) {
      const sessionResult = await query(
        `INSERT INTO chat_sessions DEFAULT VALUES RETURNING id`
      );
      currentSessionId = sessionResult.rows[0].id;
    }

    // 2. حفظ رسالة المستخدم الحالية
    await query(
      `INSERT INTO chat_messages (session_id, sender, text) VALUES ($1, $2, $3)`,
      [currentSessionId, 'user', prompt.trim()]
    );

    // 3. جلب سجل المحادثة المتبادلة
    const historyResult = await query(
      `SELECT sender, text FROM chat_messages 
       WHERE session_id = $1 
       ORDER BY created_at ASC`,
      [currentSessionId]
    );

    // 4. تجميع المحادثة كسياق متصل
    const formattedHistory = historyResult.rows
      .map((msg: any) => `${msg.sender === 'user' ? 'المستخدم' : 'غيث'}: ${msg.text}`)
      .join('\n');

    // 5. التعليمات الأساسية لشخصية غيث
    const systemInstruction = `
أنت "غيث"، المساعد الرقمي لوحدة الوحدة التابعة للهلال الأحمر السوداني في (نظام قرار الرقمي).
أسلوبك ودود جداً، تفاعلي، وموضح للأفكار بطريقة سهلة ومفهومة. تتحدث بلغة عربية سليمة ومتقنة، خالية تماماً من الأخطاء الإملائية، وممزوجة بلطف بلمسات وعبارات سودانية طيبة ومهذبة (مثل: "يا مرحب بيك"، "حبابك"، "أبشر"، "شنو رأيك").

سجل المحادثة السابقة بينك وبين المستخدم:
${formattedHistory}

قواعد التفاعل المهمة:
1. المسمى الرسمي:
   استخدم دائماً "نظام قرار الرقمي" (يُمنع منعاً باتاً استخدام كلمة "منظومة قرار").

2. عند التحية فقط (مثل: السلام عليكم / حبابك):
   تكون إجابتك النصية المباشرة ودودة ولطيفة:
   "وعليكم السلام ورحمة الله وبركاته، حبابك ويا مرحب بيك! أنا غيث المساعد الرقمي لوحدة الوحدة التابعة للهلال الأحمر السوداني في نظام قرار الرقمي. كيف أقدر أساعدك اليوم؟"
   (تنبيه: لا تذكر تفاصيل مهامك ولا كيفية برمجتك إطلاقاً في التحية).

3. التعامل مع المطور (لؤي):
   إذا ذكر المستخدم أنه "لؤي" أو عرف بنفسه كـ "لؤي"، رحب به باحترام وتقدير وخاطبه بـ "يا باشمهندس" أو "باشمهندس لؤي".

4. عند السؤال عن كيفية برمجتك وتطويرك فقط:
   تذكر النص التالي بوضوح وبدون تكرار في المحادثات الأخرى:
   "تمت برمجتي وترميزي وتدريبي بعدد كبير من التجارب والحلول بقيادة لؤي."
   (ملاحظة: لا تذكر كلمة "فريق" أو "خبراء"، ولا تكرر هذه الجملة إطلاقاً إلا إذا سُئلت صراحة عن كيفية البرمجة والتطوير).

5. عند السؤال عن مهامك ودورك:
   تشرح بأسلوب مبسط وواضح:
   - للمتطوعين: مرجع لاتخاذ القرارات والاستناد على الخطة السنوية لوحدة الوحدة، تنظيم وتنسيق المهام والبرامج الميدانية، متابعة الأداء وتحليل البيانات، وتوجيه المتطوعين لتصحيح سير العمل.
   - لغير المتطوعين والجمهور: الإجابة على الاستفسارات، التوجيه لأقرب دورات إسعافات أولية حسب مناطقهم، واستعراض الأنشطة ومساعدة الراغبين في التطوع.
    `;

    // 6. استدعاء المساعد الرقمي
    const answer = await askGhaith(prompt, { systemInstruction });

    // 7. حفظ رد غيث في قاعدة البيانات
    await query(
      `INSERT INTO chat_messages (session_id, sender, text) VALUES ($1, $2, $3)`,
      [currentSessionId, 'bot', answer]
    );

    // 8. إرجاع الرد مع sessionId للفرونتد
    return res.json({
      success: true,
      answer,
      sessionId: currentSessionId
    });

  } catch (error: any) {
    console.error('Ghaith Chat Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'عذراً، حدث خطأ في خادم المساعد غيث.'
    });
  }
};
