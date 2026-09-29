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
const pendingAdminUnpause = new Map<string, boolean>();

const ADMIN_PHONE = process.env.ADMIN_PHONE || ""; // الرقم السعودي الأدمن

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

    const cleanSenderPhone = senderJid.replace('@s.whatsapp.net', '').replace('@lid', '');
    const cleanAdminPhone = ADMIN_PHONE.replace('@s.whatsapp.net', '').replace('@lid', '');

    // 2️⃣ التفاعل الإداري والربط التفاعلي مع رقمك السعودي
    if (cleanAdminPhone && cleanSenderPhone === cleanAdminPhone) {
      await handleAdminInteraction(sock, senderJid, messageText, dbPool);
      return;
    }

    // حفظ آخر محادثة استقبالاً
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
      const cleanNumber = ADMIN_PHONE.trim().replace(/[^0-9]/g, '');
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
// التفاعل التفاعلي والإداري مع لؤي (الرقم السعودي)
// ==========================================
async function handleAdminInteraction(sock: WASocket, adminJid: string, text: string, db: Pool) {
  const command = text.trim();

  // 1️⃣ حالة انتظار تحديد الرقم المراد فكه بعد إرسال "فك"
  if (pendingAdminUnpause.get(adminJid)) {
    pendingAdminUnpause.delete(adminJid);

    if (command === "الكل" || command === "كل الاقام" || command === "الجميع") {
      pausedChats.clear();
      await sock.sendMessage(adminJid, { text: "أبشر يا باشمهندس .. تم فك وتفعيل التعليق عن كل الأرقام والمحادثات هسي .." });
      return;
    } else {
      const cleanTargetPhone = command.replace(/[^0-9]/g, '');
      let foundJid = "";
      for (const [jid] of pausedChats.entries()) {
        if (jid.includes(cleanTargetPhone)) {
          foundJid = jid;
          break;
        }
      }

      if (foundJid) {
        pausedChats.delete(foundJid);
        await sock.sendMessage(adminJid, { text: `أبشر يا باشمهندس .. تم فك التعليق عن الرقم (${cleanTargetPhone}) وجاهز للرد ..` });
      } else {
        const targetJid = cleanTargetPhone.includes('@s.whatsapp.net') ? cleanTargetPhone : `${cleanTargetPhone}@s.whatsapp.net`;
        pausedChats.delete(targetJid);
        await sock.sendMessage(adminJid, { text: `أبشر يا باشمهندس .. تم فك التعليق عن الرقم (${cleanTargetPhone}) ..` });
      }
      return;
    }
  }

  // 2️⃣ أمر "فك"
  if (command === "فك" || command === "تفعيل" || command === "فك التعليق") {
    pendingAdminUnpause.set(adminJid, true);
    await sock.sendMessage(adminJid, { text: "أبشر يا باشمهندس .. حبابك .. داير تفك التعليق عن ياتو رقم بالظبط؟ ولا داير تفك التعليق عن كل الأرقام؟" });
    return;
  }

  // 3️⃣ أوامر الإيقاف والتشغيل العامة
  if (command === "توقف" || command === "وقف") {
    globalIsActive = false;
    await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('is_active', 'false') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'false'");
    await sock.sendMessage(adminJid, { text: "أبشر يا باشمهندس .. تم إيقاف غيث عن العمل تماماً .." });
    return;
  }

  if (command === "تشغيل" || command === "اشتغل") {
    globalIsActive = true;
    pausedChats.clear();
    await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('is_active', 'true') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'true'");
    await sock.sendMessage(adminJid, { text: "أبشر يا باشمهندس .. تم تشغيل غيث وفك كل المحادثات المعلقة .." });
    return;
  }

  if (command.startsWith("حالة:")) {
    const newStatus = command.replace("حالة:", "").trim();
    currentStatusContext = newStatus;
    await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('custom_status', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1", [newStatus]);
    await sock.sendMessage(adminJid, { text: `أبشر يا باشمهندس .. تم تحديث حالتك إلى:\n"${newStatus}"` });
    return;
  }

  // 4️⃣ ربط وتمرير ردك الإداري المباشر للشخص المعني
  if (lastUrgentUserJid) {
    const targetUserJid = lastUrgentUserJid;
    
    // صياغة الرد المار للشخص بناءً على ما كتبته
    const forwardPrompt = `
أنت "غيث" .. قام الباشمهندس لؤي بالتواصل معك للرد على الشخص المعني هسي ..
رسالة الباشمهندس لؤي لك هي: "${command}"

قم بنقل فحوى كلام لؤي للشخص باللهجة السودانية اللطيفة ووضح له متى أو كيف سيتواصل معه لؤي ..
استخدم النقاط (..) وبدون علامات ترقيم .. وبدون إطالة ..
`;

    const userReply = await askGhaith(command, { systemInstruction: forwardPrompt });
    const sentMsg = await sock.sendMessage(targetUserJid, { text: userReply });
    
    if (sentMsg?.key?.id) {
      ghaithSentMessageIds.add(sentMsg.key.id);
    }
    
    // فك التعليق عن الشخص
    pausedChats.delete(targetUserJid);

    await logChatMessage(db, targetUserJid, 'assistant', userReply);
    await sock.sendMessage(adminJid, { text: `أبشر يا باشمهندس .. تم إبلاغ الشخص بالرد التالي:\n\n"${userReply}"` });
    return;
  }

  // 5️⃣ النقاش العادي مع الأدمن
  const adminPrompt = `
أنت "غيث" .. تتحدث مع رئيسك الإداري (باشمهندس لؤي) ..
خاطبه بـ "يا باشمهندس" .. بلهجة سودانية محترمة ولطيفة واستخدم النقاط (..) بدلاً من علامات الترقيم ..
رسالة الباشمهندس: "${command}"
`;

  const adminReply = await askGhaith(command, { systemInstruction: adminPrompt });
  await sock.sendMessage(adminJid, { text: adminReply });
}

// ==========================================
// وظائف السجل
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
