// src/services/ghaithPrivateService.ts

import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { Pool } from 'pg';
import { askGhaith } from './ghaithService';

// ==========================================
// المتغيرات والذاكرة المؤقتة (In-Memory State)
// ==========================================
let globalIsActive = true;
let currentStatusContext = "لؤي مشغولاتو ضاغطة شوية هسي وراجِع ليك أول ما يفرغ ..";

// 1. خريطة الدردشات المتوقفة مؤقتاً (JID -> Timestamp)
const pausedChats = new Map<string, number>();

// 2. ذاكرة تتبع رسائل غيث الذاتية
const ghaithSentMessageIds = new Set<string>();

// 3. قفل تتابع الرسائل لمنع معالجة أكثر من رسالة لنفس الشخص في نفس اللحظة
const activeProcessingLocks = new Set<string>();

// 4. تتبع آخر شخص كان يتحدث لسهولة التوجيه والتوصيل بينك وبينه
let lastUrgentUserJid: string | null = null;

const ADMIN_PHONE = process.env.ADMIN_PHONE || ""; // الرقم السعودي الأدمن

/**
 * 🛠️ دالة مساعدة لتنظيف وتجريد أرقام الهواتف من أي رموز أو صيغ واتساب
 */
function cleanPhoneDigits(input: string | null | undefined): string {
  if (!input) return '';
  const base = input.split('@')[0].split(':')[0];
  return base.replace(/\D/g, '');
}

/**
 * 🛠️ دالة مطابقة الأرقام للتأكد من هوية الأدمن بمرونة عالية
 */
function isSamePhone(phone1: string, phone2: string): boolean {
  const p1 = cleanPhoneDigits(phone1);
  const p2 = cleanPhoneDigits(phone2);
  if (!p1 || !p2) return false;
  
  if (p1 === p2) return true;
  if (p1.length >= 8 && p2.length >= 8) {
    return p1.endsWith(p2) || p2.endsWith(p1);
  }
  return false;
}

/**
 * 🟢 استرجاع الإعدادات الحفظية عند تشغيل السيرفر
 */
export async function loadGhaithSettings(dbPool: Pool) {
  try {
    const res = await dbPool.query('SELECT setting_key, setting_value FROM ghaith_settings');
    for (const row of res.rows) {
      if (row.setting_key === 'is_active') {
        globalIsActive = row.setting_value === 'true';
      }
      if (row.setting_key === 'custom_status') {
        currentStatusContext = row.setting_value;
      }
    }
    console.log(`🤖 [غيث]: تم تحميل الإعدادات بنجاح (الحالة العامة: ${globalIsActive ? 'نشط' : 'متوقف'}).`);
  } catch (err) {
    console.error('⚠️ [غيث]: اعتمد الإعدادات الافتراضية.');
  }
}

/**
 * 🟢 الدالة الرئيسية لمعالجة كافة الدردشات الخاصة
 */
export async function handlePrivateChatMessage(
  sock: WASocket,
  msg: WAMessage,
  dbPool: Pool
) {
  try {
    if (!msg.message) return;

    const senderJid = msg.key.remoteJid || "";
    const isFromMe = msg.key.fromMe || false;

    // تجاهل رسائل المجموعات
    if (senderJid.endsWith('@g.us')) return;

    // استخراج نص الرسالة
    const messageText =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    if (!messageText.trim()) return;

    // 1️⃣ معالجة الرسائل الصادرة من نفس رقم MTN (fromMe = true)
    if (isFromMe) {
      const msgId = msg.key.id;
      if (msgId && ghaithSentMessageIds.has(msgId)) {
        ghaithSentMessageIds.delete(msgId);
        return;
      }

      // إذا رد لؤي يدوياً من جوال MTN -> إيقاف غيث لمدة ساعتين
      const pauseUntil = Date.now() + 2 * 60 * 60 * 1000;
      pausedChats.set(senderJid, pauseUntil);
      console.log(`[غيث] تم إيقاف غيث أوتوماتيكياً في الدردشة ${senderJid} لمدة ساعتين بسبب رد لؤي اليدوي.`);
      return;
    }

    // 2️⃣ التفاعل الإداري والربط الذكي مع رقمك السعودي (الأدمن)
    if (ADMIN_PHONE && isSamePhone(senderJid, ADMIN_PHONE)) {
      await handleAdminInteraction(sock, senderJid, messageText, dbPool);
      return;
    }

    // حفظ أحدث محادثة استقبالاً
    lastUrgentUserJid = senderJid;

    // 3️⃣ فحص الإيقاف العام
    if (!globalIsActive) return;

    // 4️⃣ فحص الإيقاف المؤقت للشات الفردي
    const pauseTime = pausedChats.get(senderJid);
    if (pauseTime) {
      if (Date.now() < pauseTime) return;
      pausedChats.delete(senderJid);
    }

    // 5️⃣ منع سباق العمليات للرسائل المتتالية
    if (activeProcessingLocks.has(senderJid)) return;
    activeProcessingLocks.add(senderJid);

    const cleanSenderPhone = cleanPhoneDigits(senderJid);

    // 6️⃣ فحص قائمة الاستثناءات (Blacklist)
    const blacklistRes = await dbPool.query(
      'SELECT phone_number FROM ghaith_blacklist WHERE phone_number = $1 OR phone_number = $2',
      [cleanSenderPhone, senderJid]
    );
    if (blacklistRes.rowCount && blacklistRes.rowCount > 0) {
      activeProcessingLocks.delete(senderJid);
      return;
    }

    // ✍ إظهار حالة "جاري الكتابة..." فوراً
    await sock.sendPresenceUpdate('composing', senderJid);

    // 7️⃣ جلب اسم الشخص إن وجد
    let senderName = "";
    const profileRes = await dbPool.query(
      'SELECT full_name FROM volunteer_profiles WHERE whatsapp LIKE $1 OR phone LIKE $2 LIMIT 1',
      [`%${cleanSenderPhone}%`, `%${cleanSenderPhone}%`]
    );
    if (profileRes.rows.length > 0 && profileRes.rows[0].full_name) {
      senderName = profileRes.rows[0].full_name;
    }

    // 8️⃣ جلب السجل
    const historyText = await getFormattedHistoryAndManageMemory(dbPool, senderJid);

    // 9️⃣ تقييم الذكاء الاصطناعي لحالة الإشعار والإجابة (AI Urgency Evaluation)
    const systemInstruction = `
أنت "غيث" .. المساعد الرقمي الذكي الخاص بـ "لؤي" (لؤي جعفر) ..

[قواعد اللهجة والأسلوب]:
- اتكلم بلهجة سودانية محبوبة .. لطيفة .. وبسيطة جداً بدون تكلف ..
- ممنوع نهائياً أسلوب الذكاء الاصطناعي الرتيب مثل ("كيف يمكنني مساعدتك؟" أو "هل لديك أي استفسار آخر؟") ..
- ممنوع استخدام الشولة وعلامات الترقيم الرسمية .. استخدم النقطتين المزدوجة بين الجمل (..) ..
- ممنوع تفبرك أسباب أو تؤلف تفاصيل من عندك عن شغل لؤي (مثل اجتمعات أو مشاريع مع التيم) ..
- ما تكرر اسم "لؤي" كتير .. اتكلم في الموضوع المباشر ..

[قواعد تقييم أهمية الرسالة والرد]:
1. إذا لاحظت أن المتحدث أمه، أبوه، زول مستعجل، عنده موضوع مهم، أو أصر على التواصل العاجل:
   - يجب أن تتعهد له بلطافة وبدون كذب صريح: "أبشر .. هسي كلمت لؤي ونبهتو لموضوعك .. أول ما يفرغ أو يرد علي حأرجع أوريك طوالي حيتصل بيك متين .."
   - أضف الكود المرجعي [NOTIFY_ADMIN] في أقصى نهاية الرد حتى أرسل التنبيه للؤي فوراً.

[معلومات الشات]:
- اسم الشخص: "${senderName}"
- حالة لؤي الحالية: "${currentStatusContext}"

[سجل المحادثة السابق]:
${historyText}
`;

    let replyFromGemini = await askGhaith(messageText, {
      systemInstruction: systemInstruction
    });

    // إذا قرر النموذج إخطار الأدمن
    const shouldNotifyAdmin = replyFromGemini.includes('[NOTIFY_ADMIN]');
    replyFromGemini = replyFromGemini.replace('[NOTIFY_ADMIN]', '').trim();

    // إرسال التنبيه الفعلي للأدمن فقط إذا تقرر ذلك بذكاء
    if (shouldNotifyAdmin && ADMIN_PHONE) {
      const cleanNumber = cleanPhoneDigits(ADMIN_PHONE);
      const adminJid = cleanNumber.includes('@s.whatsapp.net') ? cleanNumber : `${cleanNumber}@s.whatsapp.net`;

      const alertMsg = `🚨 *تنبيه عاجل يا باشمهندس لؤي*\n\n` +
        `👤 *من:* ${senderName || cleanSenderPhone} (${cleanSenderPhone})\n` +
        `📝 *الرسالة:* "${messageText}"\n\n` +
        `💡 *ملاحظة:* تم تقييم الموضوع كأمر هام جداً .. بانتظار توجيهك بالرد ..`;

      await sock.sendMessage(adminJid, { text: alertMsg });
      console.log(`✅ [غيث]: تم إرسال إشعار عاجل حقيقي للباشمهندس عبر الرقم السعودي.`);
    }

    const sentMsg = await sock.sendMessage(senderJid, { text: replyFromGemini });

    if (sentMsg?.key?.id) {
      ghaithSentMessageIds.add(sentMsg.key.id);
    }

    await logChatMessage(dbPool, senderJid, 'user', messageText);
    await logChatMessage(dbPool, senderJid, 'assistant', replyFromGemini);

  } catch (error) {
    console.error("[غيث Error]:", error);
    if (msg.key.remoteJid) {
      await sock.sendPresenceUpdate('paused', msg.key.remoteJid);
    }
  } finally {
    if (msg.key.remoteJid) {
      activeProcessingLocks.delete(msg.key.remoteJid);
    }
  }
}

// ==========================================
// التفاعل الإداري والتحكم الذكي عبر الرقم السعودي
// ==========================================
async function handleAdminInteraction(sock: WASocket, adminJid: string, text: string, db: Pool) {
  const command = text.trim();

  // 🧠 تحليل القصد والأمر باستخدام الذكاء الاصطناعي
  const analysisInstruction = `
أنت "غيث" - المساعد الذكي الخاص بـ "لؤي" (لؤي جعفر).
يتحدث معك الآن رئيسك والمالك الباشمهندس "لؤي" من رقمه الإداري.
الرسالة الواردة منه هي: "${command}"

[معلومات النظام الحالية]:
- حالة البوت العامة (globalIsActive): ${globalIsActive ? 'نشط (شغال)' : 'متوقف'}
- حالة لؤي الحالية (currentStatusContext): "${currentStatusContext}"
- أحدث محادثة/مستخدم أخير متواصل (lastUrgentUserJid): "${lastUrgentUserJid || 'لا يوجد'}"
- المحادثات الموقوفة مؤقتاً: ${Array.from(pausedChats.keys()).join(', ') || 'لا يوجد'}

[المطلوب]:
أن تفهم قصد لؤي بدقة وتحدد الإجراء (action) المناسب وتستخرج البيانات المطلوبة، مع صياغة رد مباشر ولطيف له بلهجة سودانية محترمة واستخدام النقاط المزدوجة (..) بدلاً من علامات الترقيم.

يجب أن ترجع النتيجة بصيغة JSON حصرية مستخدماً الشفرة التالية فقط:
{
  "action": "TOGGLE_BOT" | "UNPAUSE" | "BLACKLIST" | "SET_STATUS" | "FORWARD_REPLY" | "CHAT_OR_QUERY",
  "target": "قيمة الهدف إن وجدت (مثلاً: ON/OFF/ALL/رقم هاتف/نص الحالة)",
  "replyContent": "فحوى الكلام المراد صياغته وإرساله للشخص المعني في حال كان الإجراء FORWARD_REPLY",
  "adminResponse": "ردك المباشر يا غيث للباشمهندس لؤي بلهجة سودانية لطيفة يوضح له ما قمت به أو يجيب عن استفساره"
}

[شرح الإجراءات]:
- TOGGLE_BOT: تشغيل أو إيقاف غيث بالكامل (target تكون "ON" أو "OFF").
- UNPAUSE: فك التعليق والمحادثات الموقوفة (target تكون "ALL" أو رقم هاتف محدد).
- BLACKLIST: حظر/استثناء رقم هاتف لمنع غيث من الرد عليه نهائياً (target تكون رقم الهاتف أو "LAST" للشخص الأخير).
- SET_STATUS: تغيير نص حالة لؤي الحالية (target تكون نص الحالة الجديد).
- FORWARD_REPLY: عندما يطلب منك لؤي الرد على شخص معين أو الزول الأخير وتوصيل رسالة له (target تكون "LAST" أو رقم هاتف، و replyContent تحتوي الرسالة المطلوب إبلاغها).
- CHAT_OR_QUERY: محادثة عامة، استفسار، تحية، أو كلام لا يتضمن أمراً تنفيذياً.
`;

  try {
    const rawAnalysis = await askGhaith(command, { systemInstruction: analysisInstruction });

    // استخراج كود JSON من النص
    let jsonStr = rawAnalysis.trim();
    if (jsonStr.includes('{') && jsonStr.includes('}')) {
      jsonStr = jsonStr.substring(jsonStr.indexOf('{'), jsonStr.lastIndexOf('}') + 1);
    }

    const parsed = JSON.parse(jsonStr);
    const action = parsed.action || "CHAT_OR_QUERY";
    const target = parsed.target || "";
    const replyContent = parsed.replyContent || "";
    let adminResponse = parsed.adminResponse || "أبشر يا باشمهندس .. أمرك مجاب ..";

    // 1️⃣ تنفيذ الإجراء المطلوب بناءً على تحليل القصد:

    if (action === "TOGGLE_BOT") {
      if (target === "OFF" || command.includes("وقف") || command.includes("توقف") || command.includes("طفي")) {
        globalIsActive = false;
        await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('is_active', 'false') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'false'");
      } else {
        globalIsActive = true;
        pausedChats.clear();
        await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('is_active', 'true') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'true'");
      }
    } 
    else if (action === "UNPAUSE") {
      if (target === "ALL" || command.includes("الكل") || command.includes("الجميع")) {
        pausedChats.clear();
      } else if (target) {
        const cleanTarget = cleanPhoneDigits(target);
        for (const [jid] of pausedChats.entries()) {
          if (cleanPhoneDigits(jid).includes(cleanTarget)) {
            pausedChats.delete(jid);
          }
        }
      } else {
        pausedChats.clear();
      }
    } 
    else if (action === "BLACKLIST") {
      let targetJid = target;
      if (target === "LAST" || !target) {
        targetJid = lastUrgentUserJid || "";
      }
      const cleanTarget = cleanPhoneDigits(targetJid);
      if (cleanTarget) {
        await db.query(
          "INSERT INTO ghaith_blacklist (phone_number) VALUES ($1) ON CONFLICT DO NOTHING",
          [cleanTarget]
        );
        pausedChats.delete(`${cleanTarget}@s.whatsapp.net`);
      }
    } 
    else if (action === "SET_STATUS") {
      if (target) {
        currentStatusContext = target;
        await db.query(
          "INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('custom_status', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
          [target]
        );
      }
    } 
    else if (action === "FORWARD_REPLY") {
      let targetJid = (target && target !== "LAST") ? target : lastUrgentUserJid;
      if (targetJid && !targetJid.includes('@s.whatsapp.net')) {
        const cleanNumber = cleanPhoneDigits(targetJid);
        targetJid = `${cleanNumber}@s.whatsapp.net`;
      }

      if (targetJid) {
        const forwardPrompt = `
أنت "غيث" .. قام الباشمهندس لؤي بالتواصل معك للرد على الشخص المعني هسي ..
رسالة/توجيه الباشمهندس لؤي المراد توصيله للشخص هي: "${replyContent || command}"

قم بنقل فحوى كلام لؤي للشخص باللهجة السودانية اللطيفة ووضح له ما أخبرك به لؤي ..
استخدم النقاط (..) وبدون علامات ترقيم .. وبدون إطالة ..
`;
        const userReply = await askGhaith(replyContent || command, { systemInstruction: forwardPrompt });
        const sentMsg = await sock.sendMessage(targetJid, { text: userReply });
        
        if (sentMsg?.key?.id) {
          ghaithSentMessageIds.add(sentMsg.key.id);
        }
        
        pausedChats.delete(targetJid);
        await logChatMessage(db, targetJid, 'assistant', userReply);
      } else {
        adminResponse = "أبشر يا باشمهندس .. لكن مافي زول أخير مسجل في النظام هسي عشان أرسل ليهو الرد ..";
      }
    }

    // إرسال تأكيد الاستجابة والرد للباشمهندس لؤي
    await sock.sendMessage(adminJid, { text: adminResponse });

  } catch (err) {
    console.error("[غيث Admin Error]:", err);
    // fallback في حال حدث أي خطأ في تحليل JSON
    const adminPrompt = `
أنت "غيث" .. تتحدث مع رئيسك والمالك الباشمهندس "لؤي" من رقمه الإداري ..
خاطبه بـ "يا باشمهندس" .. بلهجة سودانية محترمة ولطيفة واستخدم النقاط (..) بدلاً من علامات الترقيم ..
رسالة الباشمهندس: "${command}"
`;
    const fallbackReply = await askGhaith(command, { systemInstruction: adminPrompt });
    await sock.sendMessage(adminJid, { text: fallbackReply });
  }
}

// ==========================================
// وظائف السجل والذاكرة
// ==========================================
async function logChatMessage(db: Pool, phone: string, role: 'user' | 'assistant', text: string) {
  await db.query(
    'INSERT INTO ghaith_chat_logs (sender_phone, role, message_text) VALUES ($1, $2, $3)',
    [phone, role, text]
  );
}

async function getFormattedHistoryAndManageMemory(db: Pool, phone: string): Promise<string> {
  const res = await db.query(
    'SELECT role, message_text FROM ghaith_chat_logs WHERE sender_phone = $1 ORDER BY created_at ASC',
    [phone]
  );

  if (res.rows.length > 12) {
    const fullLog = res.rows.map(r => `${r.role}: ${r.message_text}`).join('\n');
    const summarizePrompt = `قم بتلخيص هذه المحادثة في 3 أسطر مركزة تستخرج أهم النقاط والطلبات بدون علامات ترقيم وبنقاط متتابعة ..:\n\n${fullLog}`;
    const summary = await askGhaith(summarizePrompt, {
      systemInstruction: "أنت ملخص احترافي لغيث .."
    });

    await db.query('DELETE FROM ghaith_chat_logs WHERE sender_phone = $1', [phone]);
    await logChatMessage(db, phone, 'assistant', `[ملخص المحادثة السابقة]: ${summary}`);

    return `[ملخص المحادثة السابقة]: ${summary}`;
  }

  return res.rows.map(r => `${r.role === 'user' ? 'المستخدم' : 'غيث'}: ${r.message_text}`).join('\n');
}
