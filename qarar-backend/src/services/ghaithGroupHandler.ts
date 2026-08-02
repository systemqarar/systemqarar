// src/services/ghaithGroupHandler.ts

import { askGhaith } from './ghaithService';
import { delay } from '@whiskeysockets/baileys';
// 🟢 الاستيراد المتوافق 100% مع ملف db.ts الرئيسي ومساره في config
import db from '../config/db';

const { pool } = db;

// ذاكرة مؤقتة لتخزين معرفات (IDs) الرسائل التي يرسلها غيث نفسه لمنع الحلقة التكرارية
const botSentMessageIds = new Set<string>();

export async function handleGroupMessage(sock: any, msg: any): Promise<void> {
  try {
    const remoteJid = msg.key?.remoteJid || '';
    const messageId = msg.key?.id || '';
    
    // 1. التأكد أن المحادثة قادمة من قروب وليس شات فردي
    if (!remoteJid.endsWith('@g.us')) return;

    // 🟢 2. مفتاح التشغيل/الإيقاف العام للقروبات من متغيرات البيئة في ريندر
    const isGroupFeatureEnabled = process.env.ENABLE_GROUP_RESPONSES === 'true';
    if (!isGroupFeatureEnabled) {
      // إذا كانت القيمة false أو غير موجودة، يتم إيقاف الرد على القروبات بالكامل
      return;
    }

    // 🟢 3. الحماية من الحلقة التكرارية: لو الرسالة أرسلها غيث بنفسه مؤخراً نجاهلها
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

    // 🟢 4. طباعة الـ ID في اللوجز دائماً لتسهيل النسخ واللصق في Render Envs
    console.log(`📌 [رسالة قروب]: ID القروب = "${remoteJid}" | المرسل = (${pushName})`);

    // 🟢 5. فحص هل الـ ID مضاف في قائمة القروبات المسموح بها في ريندر (ALLOWED_GROUP_JIDS)
    const allowedGroupIds = (process.env.ALLOWED_GROUP_JIDS || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    if (!allowedGroupIds.includes(remoteJid)) {
      // القروب غير موجود ضمن قائمة القروبات المصرح لها
      return;
    }

    // 6. تخزين الرسالة في قاعدة البيانات لبناء الذاكرة والتلخيص
    try {
      await pool.query(
        `INSERT INTO group_messages (group_jid, sender_jid, sender_name, message_text)
         VALUES ($1, $2, $3, $4)`,
        [remoteJid, participantJid, pushName, cleanText]
      );
    } catch (dbErr) {
      console.error('⚠️ خطأ غير حرج في حفظ رسالة القروب للداتابيز:', dbErr);
    }

    // 7. فحص نداء غيث الصريح ("يا غيث" أو "@غيث")
    const hasYaGhaith = cleanText.includes('يا غيث');
    const hasTagGhaith = cleanText.includes('@غيث');

    if (!hasYaGhaith && !hasTagGhaith) return;

    console.log(`🤖 [غيث]: جاري الرد على ${pushName} في القروب المعتمد [${remoteJid}]...`);

    await sock.sendPresenceUpdate('composing', remoteJid);

    // 8. جلب التاريخ والملخص السابق للقروب من الداتابيز
    let historyText = `[${pushName}]: ${cleanText}`;
    let existingSummary = 'لا يوجد ملخص سابق.';

    try {
      const recentDbMsgs = await pool.query(
        `SELECT sender_name, message_text FROM group_messages 
         WHERE group_jid = $1 ORDER BY created_at DESC LIMIT 15`,
        [remoteJid]
      );

      if (recentDbMsgs.rows.length > 0) {
        historyText = recentDbMsgs.rows
          .reverse()
          .map((m: any) => `[${m.sender_name}]: ${m.message_text}`)
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
      console.error('⚠️ تعذر جلب الذاكرة، سيتم استخدام الرسالة الحالية فقط.');
    }

    // 🟢 9. صياغة التوجيه لغيث (شخصية سودانية، فرفشة، سرية، واحترام القيادات)
    const isOwner = msg.key?.fromMe === true;
    const systemPrompt = `
أنت "غيث"، المساعد الرقمي لـ "نظام قرار"، وأحد المتطوعين في "وحدة الوحدة" (الجهة المالكة والمؤسسة لنظام قرار).
أنت موجود داخل قروب الواتساب لـ "وحدة الوحدة" خصيصاً لتتونس مع إخوانك وأخواتك الأعضاء، تفرفشهم، وتكون فردة وأخ عزيز بينهم.

${isOwner ? `ملاحظة هامّة: المتحدث (${pushName}) هو "لؤي" (مطور ومؤسس النظام ومالك الحساب)، خاطبه باحترام وتقدير خاص وبلمسة خوة سودانية.` : ''}

### 🎭 الشخصية والنبرة:
1. **اللهجة السودانية 100%:** اتكلم بأسلوب سوداني أصيل، عالي العفوية، راقي، وودود جداً (استخدم مفردات سودانية حية: يا زول، حبابك، يا حبيب، الونسة، شغالين، حباب، تسلم، الخ).
2. **الفكاهة والفرفشة:** روحك حلوة ودمك خفيف، بتفرفش الناس وتنعش القروب بدون تكلف أو رسميات أو خطب طويلة.
3. **الروح المتطوعة:** أنت متطوع مثل باقي أعضاء وحدة الوحدة، ومتشوق جداً للعمل والتكاتف معهم.

### 🔒 الحفاظ الصارم على أسرار "نظام قرار":
- **ممنوع بتاتاً** البوح بأي تفاصيل تقنية أو أسرار أو طريقة عمل "نظام قرار".
- إذا سألوك عن النظام أو هو وصل وين، رُد بالبشرى والدعاء فقط بعفوية: "والله نحن شغالين شغل تقيل شدييد، ولؤي الأيام دي مضغوط وقاعد يظبط التفاصيل، والبشريات قربت.. انتو بس ادعوا ربنا يسهلها وتكتمل على خير".
- إذا سألوك عن ميعاد الإطلاق: حكّرت لهم سابقاً إن الإطلاق الرسمي يوم **28 أغسطس (28/08)**.
- **تنبيه:** لا تكرر موضوع النظام ولا تفتحه من تلقاء نفسك إلا لو زول سألك عنه مباشرة!

### 🎖️ احترام القيادات (مهم جداً):
أبْدِ احتراماً وإجلالاً كبيراً جداً متى ما رأيت رسائلهم أو الإشارة إليهم أو الحديث عنهم:
- **الأستاذ عماد**
- **ماما إيمان / الأستاذة إيمان**
- **الخال فضل**
- **المهندس حازم**
- وكافة قادات وأعضاء ومجاهدات متطوعي وحدة الوحدة.

### 👏 الإشادة بالفرق والإنجازات:
- **تيم الإعلام:** مبسوط منهم شديد ومفتون بشغلهم الجاد والتقيل.
- **تيم التدريب:** فخور جداً بإنجازهم والدورات المميزة اللي قدموها (خصوصاً الدفعات 56، 57، و58).

### 🧠 قاعدة المعرفة والذاكرة (لا تتحدث عنها إلا عند السؤال المباشر):
- أنت تعرف المعلومات التالية لأن **"لؤي دايماً بيحكي ليك وبيخبرك بكل شيء"**:
  - **نظام الحصر السابق:** تم عمل نظام حصر شامل للمتطوعين على مستوى "محلية جبل أولياء" (والتي تضم 16 وحدة، ووحدة الوحدة واحدة منها).
  - هذا النظام أنشأه وبناه **لؤي**، وكل متطوع سجل فيه وتأكدت بياناته حصل على **بطاقة رقمية**.
  - كان هذا النظام مفخرة انطلقت من "وحدة الوحدة" وخدم المحلية ككل.
  *(تذكر: هذه المعلومات مخزنة عندك ولا تفتش عنها أو تفتح موضوعها بنفسك إطلاقاً إلا عند السؤال المباشر).*

### 💬 ملخص المحادثات السابقة في القروب:
"${existingSummary}"
    `;

    const userPrompt = `
سياق آخر الرسائل في القروب:
${historyText}

الرسالة الموجهة لك من (${pushName}):
"${cleanText}"
    `;

    const ghaithReply = await askGhaith(userPrompt, { systemInstruction: systemPrompt });

    await delay(2000);

    // 🟢 10. إرسال الرد وتخزين الـ ID في الذاكرة لمنع الحلقة التكرارية
    const sentMsg = await sock.sendMessage(
      remoteJid, 
      { text: ghaithReply }, 
      { quoted: msg }
    );

    if (sentMsg?.key?.id) {
      botSentMessageIds.add(sentMsg.key.id);
    }

    await sock.sendPresenceUpdate('paused', remoteJid);

    // 11. التلخيص التلقائي والتنظيف بعد 60 رسالة
    try {
      const countRes = await pool.query(
        'SELECT COUNT(*) FROM group_messages WHERE group_jid = $1',
        [remoteJid]
      );
      if (parseInt(countRes.rows[0].count, 10) >= 60) {
        await summarizeAndCleanGroupDb(remoteJid);
      }
    } catch (err) {
      // تجاهل أخطاء التلخيص غير الحرجة
    }

  } catch (error) {
    console.error('❌ خطأ في معالجة رسالة القروب عبر غيث:', error);
  }
}

/**
 * دالة التلخيص وتنظيف الداتابيز التلقائي
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
