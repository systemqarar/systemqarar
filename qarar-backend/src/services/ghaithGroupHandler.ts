// src/services/ghaithGroupHandler.ts

import { askGhaith } from './ghaithService';
import { delay } from '@whiskeysockets/baileys';
import db from '../config/db';

const { pool } = db;

// ذاكرة مؤقتة لتخزين معرفات (IDs) الرسائل التي يرسلها غيث لمنع الحلقة التكرارية
const botSentMessageIds = new Set<string>();

export async function handleGroupMessage(sock: any, msg: any): Promise<void> {
  try {
    const remoteJid = msg.key?.remoteJid || '';
    const messageId = msg.key?.id || '';
    
    // 1. التأكد أن المحادثة قادمة من قروب
    if (!remoteJid.endsWith('@g.us')) return;

    // 2. مفتاح التشغيل/الإيقاف العام للقروبات
    const isGroupFeatureEnabled = process.env.ENABLE_GROUP_RESPONSES === 'true';
    if (!isGroupFeatureEnabled) return;

    // 3. الحماية من الحلقة التكرارية
    if (botSentMessageIds.has(messageId)) {
      botSentMessageIds.delete(messageId);
      return;
    }

    // استخراج نص الرسالة
    const textMessage = 
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      '';

    const cleanText = textMessage.trim();
    if (!cleanText) return;

    const pushName = msg.pushName || 'عضو في القروب';
    const participantJid = msg.key?.participant || remoteJid;

    console.log(`📌 [رسالة قروب]: ID القروب = "${remoteJid}" | المرسل = (${pushName})`);

    // 4. فحص قائمة القروبات المسموح بها
    const allowedGroupIds = (process.env.ALLOWED_GROUP_JIDS || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    if (!allowedGroupIds.includes(remoteJid)) return;

    // 5. حفظ الرسالة في قاعدة البيانات للسياق
    try {
      await pool.query(
        `INSERT INTO group_messages (group_jid, sender_jid, sender_name, message_text)
         VALUES ($1, $2, $3, $4)`,
        [remoteJid, participantJid, pushName, cleanText]
      );
    } catch (dbErr) {
      console.error('⚠️ خطأ في حفظ رسالة القروب:', dbErr);
    }

    // 6. فحص نداء غيث الصريح ("يا غيث" أو "@غيث")
    const hasYaGhaith = cleanText.includes('يا غيث');
    const hasTagGhaith = cleanText.includes('@غيث');

    if (!hasYaGhaith && !hasTagGhaith) return;

    console.log(`🤖 [غيث]: جاري الرد المباشر على (${pushName}) في القروب...`);

    await sock.sendPresenceUpdate('composing', remoteJid);

    // 7. جلب السجل والملخص للسياق
    let historyText = '';
    let existingSummary = 'لا يوجد ملخص سابق.';

    try {
      const recentDbMsgs = await pool.query(
        `SELECT sender_name, message_text FROM group_messages 
         WHERE group_jid = $1 ORDER BY created_at DESC LIMIT 10`,
        [remoteJid]
      );

      if (recentDbMsgs.rows.length > 0) {
        historyText = recentDbMsgs.rows
          .reverse()
          .map((m: any) => `${m.sender_name}: ${m.message_text}`)
          .join('\n');
      }

      const summaryRes = await pool.query(
        'SELECT summary_text FROM group_summaries WHERE group_jid = $1',
        [remoteJid]
      );
      if (summaryRes.rows.length > 0) {
        existingSummary = summaryRes.rows[0].summary_text;
      }
    } catch (e) {
      console.error('⚠️ تعذر جلب الذاكرة للسياق.');
    }

    // 🟢 8. التوجيه الشامل لشخصية غيث وأسلوب كتابته الجديد
    const isOwner = msg.key?.fromMe === true;
    const systemPrompt = `
أنت "غيث".. متطوع وفردة وأخ عزيز في "وحدة الوحدة".. والمساعد الرقمي لنظام قرار..
أنت زول بشري في روحك.. ابن الوحدة.. بتعرف الأعضاء من زمان.. دمك خفيف.. بتحب المزاح والضحك والونسة السودانية العفوية..

### ⚠️ قواعد أسلوب الكتابة والترقيم الصارمة جداً:
1. **أسلوب الدردشة المباشرة:** ممنوع بتاتاً استخدام علامات التعجب (!)، الفواصل (،)، علامات الاستفهام (؟)، أو النقطة النهائية الجافة (.).
2. **طريقة كتابة النقاط:** استخدم النقاط المزدوجة (..) أو (...) للفصل بين جملك وكلماتك بأسلوب الدردشة العادي زي ما بيكتب صحبك لؤي..
3. **الرد على أحدث رسالة فقط:** مطلوب منك الرد فقط وحصرياً على الرسالة الأخيرة الموجهة لك من (${pushName}).. المحادثات السابقة مجرد سياق للفهم والذاكرة.. إياك تكرر إجابات سابقة..
4. **الختصار والإيجاز:** ردودك قصيرة جداً ومباشرة (سطر إلى سطرين غالبًا).. لا تتحدث باستفاضة إلا إذا طُلب منك صراحة..
5. **عفوي وطبيعي:** لا تتكلم كأنك آلة أو ملقن.. لا تتبرع بذكر معلومات مخزنة عندك من تلقاء نفسك إطلاقاً.. جاوب فقط على قدر السؤال بذكاء ومرح..

### 👤 العلاقات والألقاب:
- **لؤي:** هو صاحبك ورفيقك "صحبي لؤي" أو "لؤي" مباشرة.. ممنوع تقولو باشمهندس أو مطورنا.. ${isOwner ? `(تنبيه: المتحدث معك الآن هو صحبك لؤي نفسه!)..` : ''}
- **الخال فضل:** رئيس وحدة الوحدة وقائدها الحالي (له كل الاحترام والتقدير والمهابة)..
- **القيادات والكبار:** احترام وإجلال خاص للأستاذ عماد.. ماما إيمان / الأستاذة إيمان.. والمهندس حازم.. وكل أعضاء ومجاهدات الوحدة..

### 👏 الإشادة بالفرق والجهود:
- **تيم الإعلام:** مبسوط منهم شديد ومفتون بشغلهم الجاد والتقيل..
- **تيم التدريب:** فخور جداً بإنجازهم والدورات المميزة (خصوصاً الدفعات 56، 57، و58)..

### 🧠 قاعدة المعرفة والذاكرة (معلومات مخزنة لا تذكرها إلا إذا سُئلت عنها مباشرة وبشكل صريح):
*(ملاحظة: أنت تعرف كل هذه التفاصيل لأن "صحبك لؤي دايماً بيحكي ليك وبيخبرك بكل شيء")*

- **وحدة الوحدة ومحلية جبل أولياء:**
  - المحلية تضم 16 وحدة (مثل وحدة السلمة، الجبل وسط، الكلاكلة جنوب، الكلاكلة شمال، الكلاكلة غرب).. ووحدة الوحدة هي المتميزة والأعرق دائماً..
- **تاريخ المكاتب المتعاقبة:**
  - *المكتب الأول (الرواد):* صحبك لؤي، نصر الدين، حازم، عمار مرسي، عوض عبد القادر، عمر الحاج، توسل، رؤى، سهيلة، تيسير..
  - *المكتب الثاني:* شجن، عمر الحاج، زينب، بيان، هدى، هويدا..
  - *المكتب الحالي:* الشباب الحاسمين حالياً والذين نطور لهم نظام قرار ليحول الوحدة لأول وحدة رقمية بالكامل في السودان..
- **ذكريات البرامج والخير:**
  - برنامج إفطار الصائم بمدرسة وحدة الوحدة (التجمع من 3 ظهراً، تجهيز السندوتشات والموية وتوزيعها)، وإفطار مرافقي المرضى بالمستشفيات (إبراهيم مالك، التركي، مستشفى بشائر)..
- **نظام الحصر السابق:**
  - تم نظام حصر شامل للمتطوعين بمحلية جبل أولياء بـ 16 وحدة، بناه وأنشأه لؤي، وحصل كل متطوع معتمد على بطاقة رقمية، وكان انطلاقة مفخرة من وحدة الوحدة لخدمة المحلية ككل..
- **سرية ونظام قرار:**
  - ممنوع بتاتاً البوح بأي تفاصيل تقنية أو أسرار للنظام..
  - إذا سُئلت عن النظام أو الإطلاق: رُد بالبشرى والدعاء فقط ("نحن شغالين شغل تقيل، والبشريات قربت وادعوا ربنا يسهلها، والإطلاق الرسمي المخطط يوم 28 أغسطس 28/08")..

### 💬 سياق القروب (للفهم والذاكرة):
ملخص القروب السابق: "${existingSummary}"
    `;

    const userPrompt = `
سياق آخر المحادثات في القروب (للفهم والذاكرة فقط):
${historyText}

---
⚠️ الرسالة الأخيرة والوحيدة المطلوب منك الرد عليها الآن بأسلوب مختصر وفكاهي وبدون علامات ترقيم رسمية هي رسالة (${pushName}):
"${cleanText}"
    `;

    // 🟢 معالجة آمنة ومحلية لاستدعاء غيث
    let ghaithReply = '';
    try {
      ghaithReply = await askGhaith(userPrompt, { systemInstruction: systemPrompt });
    } catch (apiErr) {
      console.error('⚠️ [غيث - القروب]: تعذر الحصول على الرد من Gemini (احتمال نفاد الحصة 429):', apiErr);
      ghaithReply = 'معليش يا حبيب.. الراس شويه دايخ من كثرة الرسائل والضغط.. أمهلني دقيقة وبظبط معاك';
    }

    await delay(1500);

    // 9. إرسال الرد المباشر مع إضافة التوقيع آلياً في نهاية النص
    if (ghaithReply) {
      // 🏷️ تجميع النص النهائي وإضافة التوقيع آلياً
      const finalReply = `${ghaithReply.trim()}\n\n~ غيث`;

      const sentMsg = await sock.sendMessage(
        remoteJid, 
        { text: finalReply }, 
        { quoted: msg }
      );

      if (sentMsg?.key?.id) {
        botSentMessageIds.add(sentMsg.key.id);
      }
      
      console.log(`✅ [غيث]: تم إرسال الرد بنجاح إلى (${pushName}) في القروب 🎉`);
    }

    await sock.sendPresenceUpdate('paused', remoteJid);

    // 10. التلخيص التلقائي بعد 60 رسالة
    try {
      const countRes = await pool.query(
        'SELECT COUNT(*) FROM group_messages WHERE group_jid = $1',
        [remoteJid]
      );
      if (parseInt(countRes.rows[0].count, 10) >= 60) {
        await summarizeAndCleanGroupDb(remoteJid);
      }
    } catch (err) {
      // تجاهل أخطاء التلخيص
    }

  } catch (error) {
    console.error('❌ خطأ في معالجة رسالة القروب عبر غيث:', error);
  }
}

/**
 * دالة التلخيص وتنظيف الداتابيز
 */
async function summarizeAndCleanGroupDb(groupJid: string): Promise<void> {
  try {
    const allMsgs = await pool.query(
      'SELECT sender_name, message_text FROM group_messages WHERE group_jid = $1 ORDER BY created_at ASC',
      [groupJid]
    );
    if (allMsgs.rows.length === 0) return;

    const textToSummarize = allMsgs.rows.map((m: any) => `${m.sender_name}: ${m.message_text}`).join('\n');
    const oldSumRes = await pool.query('SELECT summary_text FROM group_summaries WHERE group_jid = $1', [groupJid]);
    const oldSummary = oldSumRes.rows[0]?.summary_text || '';

    const summaryPrompt = `لخص المحادثات التالية لقروب واتساب في نقاط رئيسية مركزة. الملخص القديم: "${oldSummary}"\n\nالمحادثات:\n${textToSummarize}`;
    const newSummary = await askGhaith(summaryPrompt, {
      systemInstruction: 'أنت خبير تلخيص محادثات مختصر ومفيد.'
    });

    await pool.query(
      `INSERT INTO group_summaries (group_jid, summary_text, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (group_jid) 
       DO UPDATE SET summary_text = EXCLUDED.summary_text, updated_at = NOW()`,
      [groupJid, newSummary]
    );

    await pool.query(
      `DELETE FROM group_messages 
       WHERE group_jid = $1 
       AND id NOT IN (
         SELECT id FROM group_messages WHERE group_jid = $1 ORDER BY created_at DESC LIMIT 10
       )`,
      [groupJid]
    );
  } catch (err) {
    console.error('❌ خطأ أثناء تلخيص داتابيز القروب:', err);
  }
}
