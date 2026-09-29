// src/services/ghaithPrivateService.ts

import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { Pool } from 'pg';
import { askGhaith } from './ghaithService';

// ==========================================
// المتغيرات والذاكرة المؤقتة (In-Memory State)
// ==========================================
let globalIsActive = true; // حالة التشغيل العامة لغيث
let currentStatusContext = "لؤي غير متاح حالياً وسيتواصل معك فور فرغته.";

// 1. خريطة الدردشات المتوقفة مؤقتاً بسبب رد لؤي اليدوي (JID -> Timestamp)
const pausedChats = new Map<string, number>();

// 2. ذاكرة تتبع رسائل غيث الذاتية لمنع تعليق الشات عن طريق الخطأ
const ghaithSentMessageIds = new Set<string>();

// 3. قفل تتابع الرسائل لمنع معالجة أكثر من رسالة لنفس الشخص في نفس اللحظة (Race Condition)
const activeProcessingLocks = new Set<string>();

// 4. حساب عدد رسائل الشخص
const chatMessageCounts = new Map<string, number>();

const ADMIN_PHONE = process.env.ADMIN_PHONE || ""; // رقم التحكم (الأدمن)

/**
 * 🟢 استرجاع الإعدادات الحفظية لغيث عند تشغيل السيرفر
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
    console.error('⚠️ [غيث]: لم يتم العثور على إعدادات سابقة، سيتم الاعتماد على الافتراضي.');
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

    // 1️⃣ معالجة الرسائل الصادرة (fromMe = true)
    if (isFromMe) {
      const msgId = msg.key.id;
      // إذا كانت الرسالة أُرسلت أوتوماتيكياً بواسطة غيث نفسه -> تجاهل بدون تعليق الشات
      if (msgId && ghaithSentMessageIds.has(msgId)) {
        ghaithSentMessageIds.delete(msgId);
        return;
      }

      // إذا كانت الرسالة أُرسلت يدويًا من لؤي من الجوال -> إيقاف غيث لمدة ساعتين
      const pauseUntil = Date.now() + 2 * 60 * 60 * 1000;
      pausedChats.set(senderJid, pauseUntil);
      console.log(`[غيث] تم إيقاف غيث أوتوماتيكياً في الدردشة ${senderJid} لمدة ساعتين بسبب رد لؤي اليدوي.`);
      return;
    }

    const cleanSenderPhone = senderJid.replace('@s.whatsapp.net', '').replace('@lid', '');
    const cleanAdminPhone = ADMIN_PHONE.replace('@s.whatsapp.net', '').replace('@lid', '');

    // 2️⃣ التحكم الشامل عبر رقمك الأدمن (الرقم السعودي)
    if (cleanAdminPhone && cleanSenderPhone === cleanAdminPhone) {
      await handleAdminCommands(sock, senderJid, messageText, dbPool);
      return;
    }

    // 3️⃣ فحص الإيقاف العام
    if (!globalIsActive) {
      console.log(`[غيث] البوت متوقف عاماً. تم تجاهل الرسالة من ${senderJid}`);
      return;
    }

    // 4️⃣ فحص الإيقاف المؤقت للدردشة الفردية (الساعتين)
    const pauseTime = pausedChats.get(senderJid);
    if (pauseTime) {
      if (Date.now() < pauseTime) {
        console.log(`[غيث] الدردشة مع ${senderJid} متوقفة مؤقتاً بسبب رد لؤي اليدوي السابق.`);
        return;
      } else {
        pausedChats.delete(senderJid); // انتهاء مدة الإيقاف
      }
    }

    // 5️⃣ منع سباق العمليات (Race Condition Lock) للرسائل المتتالية
    if (activeProcessingLocks.has(senderJid)) {
      console.log(`[غيث] يجرى معالجة رسالة أخرى للشات ${senderJid} حالياً، تم تجاوز الرسالة لمنع التكرار.`);
      return;
    }
    activeProcessingLocks.add(senderJid);

    // 6️⃣ فحص قائمة الاستثناءات (Blacklist)
    const blacklistRes = await dbPool.query(
      'SELECT phone_number FROM ghaith_blacklist WHERE phone_number = $1 OR phone_number = $2',
      [cleanSenderPhone, senderJid]
    );

    if (blacklistRes.rowCount && blacklistRes.rowCount > 0) {
      console.log(`[غيث] الرقم ${cleanSenderPhone} مستثنى من الرد.`);
      activeProcessingLocks.delete(senderJid);
      return;
    }

    // 7️⃣ التنبيه العاجل لرقم الأدمن
    const lowerText = messageText.toLowerCase();
    if (lowerText.includes("ضروري") || lowerText.includes("عاجل") || lowerText.includes("مستعجل")) {
      if (ADMIN_PHONE) {
        const alertMsg = `⚠️ *تنبيه عاجل من غيث*\n\nالرقم: ${cleanSenderPhone}\nطلب التواصل بك لأمر ضروري!\n\n*الرسالة:* "${messageText}"`;
        await sock.sendMessage(ADMIN_PHONE, { text: alertMsg });
      }
    }

    // 8️⃣ حساب عدد الرسائل وإظهار حالة "جاري الكتابة..." فوراً
    const currentCount = (chatMessageCounts.get(senderJid) || 0) + 1;
    chatMessageCounts.set(senderJid, currentCount);

    // ✍️ إرسال إشارة "جاري الكتابة..." للمتحدث
    await sock.sendPresenceUpdate('composing', senderJid);

    // 9️⃣ جلب اسم الشخص من الداتابيز
    let senderName = "الصديق/الزائر";
    const profileRes = await dbPool.query(
      'SELECT full_name FROM volunteer_profiles WHERE whatsapp LIKE $1 OR phone LIKE $2 LIMIT 1',
      [`%${cleanSenderPhone}%`, `%${cleanSenderPhone}%`]
    );
    if (profileRes.rows.length > 0 && profileRes.rows[0].full_name) {
      senderName = profileRes.rows[0].full_name;
    }

    // 🔟 جلب السجل السابق
    const historyText = await getFormattedHistoryAndManageMemory(dbPool, senderJid);

    // 🎯 صياغة التوجيهات البرمجية المباشرة لـ Gemini
    const systemInstruction = `
أنت "غيث"، المساعد الرقمي الذكي الخاص بـ "لؤي" (لؤي جعفر).

[قواعد الهوية والتواصل]:
1. أنت المساعد الرقمي الخاص بـ "لؤي" فقط. يُمنع منعاً باتاً كلياً ذكر كلمة "نظام قرار" أو أي أنظمة سابقة.
2. الطرف المتحدث معه اسمه: "${senderName}" (إذا كان الاسم باللغة الإنجليزية، نادهِ باسمه الأول باللغة العربية).
3. حالة لؤي الحالية: "${currentStatusContext}"

[تنبيه صارم لمنع التكرار]:
- إذا كان هناك كلام سابق في "سجل المحادثة"، أو أرسل المستخدم كلمة بسيطة مثل ("الو"، "معي؟"، "موجود؟"، "أيوة")، لا تكرر ديباجة التعريف بنفسك وبـ لؤي نهائياً!
- جاوب مباشرة ولطافة باختصار شديد، مثلاً: "تفضل أسمعك"، "أيوة معك تفضل"، "تفضل أخي وسأنقل كلامك للؤي فور تفرغه".
- كرر جملة "أنا غيث المساعد الرقمي للؤي..." فقط إذا كانت هذه أول محادثة بينكما على الإطلاق ولا يوجد أي سجل سابق.

[جدار حماية الخصوصية والأسرار]:
- يُمنع كشف أسرار لؤي أو تحركاته أو أرقام وتفاصيل الآخرين. إذا سُئلت عن ذلك اعتذر بكرامة ولباقة: "عذراً، هذه معلومات خاصة ولا يمكنني مشاركتها."

[سجل المحادثة السابق]:
${historyText}
`;

    // 🚀 طلب الرد من Gemini عبر محرك askGhaith
    const replyFromGemini = await askGhaith(messageText, {
      systemInstruction: systemInstruction
    });

    // إرسال الرد
    const sentMsg = await sock.sendMessage(senderJid, { text: replyFromGemini });

    // حفظ ID الرسالة لتجنب قراءة البوت لردوده كأنها ردود يدوية من لؤي
    if (sentMsg?.key?.id) {
      ghaithSentMessageIds.add(sentMsg.key.id);
    }

    // حفظ الرسائل في قاعدة البيانات
    await logChatMessage(dbPool, senderJid, 'user', messageText);
    await logChatMessage(dbPool, senderJid, 'assistant', replyFromGemini);

  } catch (error) {
    console.error("[غيث Error]:", error);
    // إيقاف مؤشر الكتابة في حال حدوث خطأ
    if (msg.key.remoteJid) {
      await sock.sendPresenceUpdate('paused', msg.key.remoteJid);
    }
  } finally {
    // إزالة قفل المعالجة
    if (msg.key.remoteJid) {
      activeProcessingLocks.delete(msg.key.remoteJid);
    }
  }
}

// ==========================================
// وظائف التحكم الإداري (ADMIN)
// ==========================================
async function handleAdminCommands(sock: WASocket, adminJid: string, text: string, db: Pool) {
  const command = text.trim();

  if (command === "توقف" || command === "وقف") {
    globalIsActive = false;
    await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('is_active', 'false') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'false'");
    await sock.sendMessage(adminJid, { text: "🛑 تم إيقاف غيث بالكامل." });
    return;
  }

  if (command === "تشغيل" || command === "اشتغل") {
    globalIsActive = true;
    pausedChats.clear(); // إزالة جميع التعليقات المؤقتة أيضاً عند التشغيل
    await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('is_active', 'true') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'true'");
    await sock.sendMessage(adminJid, { text: "✅ تم تشغيل غيث بنجاح وإلغاء كافة التعليقات المؤقتة للدردشات." });
    return;
  }

  if (command === "فك" || command === "تفعيل الكل" || command === "إلغاء التعليق") {
    pausedChats.clear();
    await sock.sendMessage(adminJid, { text: "🔓 تم إلغاء كافة التعليقات المؤقتة للدردشات فوراً." });
    return;
  }

  if (command.startsWith("حالة:")) {
    const newStatus = command.replace("حالة:", "").trim();
    currentStatusContext = newStatus;
    await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('custom_status', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1", [newStatus]);
    await sock.sendMessage(adminJid, { text: `📌 تم تحديث حالتك لدى غيث إلى:\n"${newStatus}"` });
    return;
  }

  if (command.startsWith("استثناء ")) {
    const phoneToBlock = command.replace("استثناء ", "").trim();
    await db.query("INSERT INTO ghaith_blacklist (phone_number) VALUES ($1) ON CONFLICT DO NOTHING", [phoneToBlock]);
    await sock.sendMessage(adminJid, { text: `🚫 تم حظر الرقم (${phoneToBlock}).` });
    return;
  }

  if (command.startsWith("تفعيل ")) {
    const phoneToUnblock = command.replace("تفعيل ", "").trim();
    await db.query("DELETE FROM ghaith_blacklist WHERE phone_number = $1", [phoneToUnblock]);
    await sock.sendMessage(adminJid, { text: `✅ تم إلغاء حظر الرقم (${phoneToUnblock}).` });
    return;
  }

  const helpMenu = `🤖 *لوحة تحكم غيث:*\n\n` +
    `• *توقف* : إيقاف البوت كلياً.\n` +
    `• *تشغيل* : إعادة التفعيل وتصفير التعليقات.\n` +
    `• *فك* : إلغاء تعليق الدردشات فوراً.\n` +
    `• *حالة: [النص]* : تحديث حالتك.\n` +
    `• *استثناء [الرقم]* : حظر رقم.\n` +
    `• *تفعيل [الرقم]* : إلغاء حظر الرقم.`;
  
  await sock.sendMessage(adminJid, { text: helpMenu });
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
    const summarizePrompt = `قم بتلخيص هذه المحادثة في 3 أسطر مركزة تستخرج أهم النقاط والطلبات:\n\n${fullLog}`;
    const summary = await askGhaith(summarizePrompt, {
      systemInstruction: "أنت ملخص احترافي، تلخص النقاط المهمة فقط."
    });

    await db.query('DELETE FROM ghaith_chat_logs WHERE sender_phone = $1', [phone]);
    await logChatMessage(db, phone, 'assistant', `[ملخص المحادثة السابقة]: ${summary}`);

    return `[ملخص المحادثة السابقة]: ${summary}`;
  }

  return res.rows.map(r => `${r.role === 'user' ? 'المستخدم' : 'غيث'}: ${r.message_text}`).join('\n');
}
