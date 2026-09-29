// src/services/ghaithPrivateService.ts

import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { Pool } from 'pg';
import { askGhaith } from './ghaithService'; // 👈 الربط المباشر مع محرك غيث الرئيسي

// ==========================================
// المتغيرات والذاكرة المؤقتة
// ==========================================
let globalIsActive = true; // حالة التشغيل العامة لغيث
let currentStatusContext = "لؤي غير متاح حالياً وسيتواصل معك فور فرغته.";
const pausedChats = new Map<string, number>(); // إيقاف الدردشات الفردية (مؤقت ساعتين)
const chatMessageCounts = new Map<string, number>(); // حساب عدد رسائل الشخص للتعريف التدريجي

const ADMIN_PHONE = process.env.ADMIN_PHONE || ""; // رقم التحكم الخاص بك

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
    console.error('⚠️ [غيث]: لم يتم العثور على إعدادات سابقة في الداتابيز، سيتم الاعتماد على الإعدادات الافتراضية.');
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

    // تجاهل رسائل المجموعات (القروبات)
    if (senderJid.endsWith('@g.us')) return;

    // استخراج النص من مختلف أنواع الرسائل
    const messageText =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    if (!messageText.trim()) return;

    // 1️⃣ إذا رد لؤي بنفسه من هاتفه الشخصي -> إيقاف غيث في هذه الدردشة لمدة ساعتين
    if (isFromMe) {
      const pauseUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 Hours
      pausedChats.set(senderJid, pauseUntil);
      console.log(`[غيث] تم إيقاف غيث أوتوماتيكياً في الدردشة ${senderJid} لمدة ساعتين بسبب رد لؤي.`);
      return;
    }

    const cleanSenderPhone = senderJid.replace('@s.whatsapp.net', '');
    const cleanAdminPhone = ADMIN_PHONE.replace('@s.whatsapp.net', '');

    // 2️⃣ التحكم الشامل عبر رقمك الثاني (ADMIN_PHONE)
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
    if (pauseTime && Date.now() < pauseTime) {
      console.log(`[غيث] الدردشة مع ${senderJid} متوقفة مؤقتاً بسبب رد لؤي السابِق.`);
      return;
    }

    // 5️⃣ فحص قائمة الاستثناءات (Blacklist)
    const blacklistRes = await dbPool.query(
      'SELECT phone_number FROM ghaith_blacklist WHERE phone_number = $1 OR phone_number = $2',
      [cleanSenderPhone, senderJid]
    );

    if (blacklistRes.rowCount && blacklistRes.rowCount > 0) {
      console.log(`[غيث] الرقم ${cleanSenderPhone} موجود في قائمة الاستثناءات. تم التجاهل.`);
      return;
    }

    // 6️⃣ التنبيه العاجل لرقمك الثاني (Urgent Escalation)
    const lowerText = messageText.toLowerCase();
    if (lowerText.includes("ضروري") || lowerText.includes("عاجل") || lowerText.includes("مستعجل")) {
      if (ADMIN_PHONE) {
        const alertMsg = `⚠️ *تنبيه عاجل من غيث*\n\nالرقم: ${cleanSenderPhone}\nطلب التواصل بك لأمر ضروري!\n\n*الرسالة:* "${messageText}"`;
        await sock.sendMessage(ADMIN_PHONE, { text: alertMsg });
      }
    }

    // 7️⃣ قواعد الحوار والرد التدريجي
    const currentCount = (chatMessageCounts.get(senderJid) || 0) + 1;
    chatMessageCounts.set(senderJid, currentCount);

    const isSimpleGreeting = /^s*(السلام عليكم|سلام|مرحبا|اهلين|مرحبتين|مرحبا بك)s*$/i.test(messageText.trim());

    if (currentCount === 1 && isSimpleGreeting) {
      const initialReply = "وعليكم السلام ورحمة الله وبركاته.";
      await sock.sendMessage(senderJid, { text: initialReply });
      await logChatMessage(dbPool, senderJid, 'user', messageText);
      await logChatMessage(dbPool, senderJid, 'assistant', initialReply);
      return;
    }

    // 8️⃣ جلب اسم الشخص من قاعدة البيانات (إن وجد)
    let senderName = "الصديق/الزائر";
    const profileRes = await dbPool.query(
      'SELECT full_name FROM volunteer_profiles WHERE whatsapp LIKE $1 OR phone LIKE $2 LIMIT 1',
      [`%${cleanSenderPhone}%`, `%${cleanSenderPhone}%`]
    );
    if (profileRes.rows.length > 0 && profileRes.rows[0].full_name) {
      senderName = profileRes.rows[0].full_name;
    }

    // 9️⃣ جلب وتلخيص السجل السابق
    const historyText = await getFormattedHistoryAndManageMemory(dbPool, senderJid);

    // 🔟 صياغة التوجيهات البرمجية لـ Gemini المارة عبر askGhaith
    const customSystemInstruction = `
الطرف المتحدث معه اسمه: "${senderName}" (إذا كان الاسم باللغة الإنجليزية، نادهِ باسمه الصريح باللغة العربية).

[حالة لؤي الحالية]:
"${currentStatusContext}"

[قواعد الحوار والصياغة]:
1. ${currentCount === 2 ? 'هذه الرسالة الثانية للشخص؛ ابدأ بالتعريف بنفسك بلباقة: "أنا غيث المساعد الرقمي للؤي، وهو غير متاح حالياً وستصله رسائلك..."' : 'تحدث بأريحية ولباقة وبدون إطالة زائدة.'}
2. رد باختصار وبدون حشو، إلا إذا كان الشخص منفتحاً ومسترسلاً في الكلام.
3. وعد المتحدث دائماً بأن لؤي سيطلع على الرسائل فور تفرغه.

[جدار حماية الخصوصية والأسرار الصارم - STRICT PRIVACY]:
1. يُمنع منعاً باتاً ومطلقاً كشف أي أسرار، أو مناقشات، أو معلومات شخصية تخص لؤي أو أي شخص آخر.
2. إذا سُئلت أسئلة مثل: (مع من يتحدث لؤي؟ / أين لؤي؟ / ما هي مشاريعه؟ / أعطني أرقام فلان): اعتذر فوراً وبكل حزم ولباقة: "عذراً، هذه معلومات خاصة ولا يمكنني مشاركتها."

[سجل المحادثة السابق]:
${historyText}
`;

    // 🚀 طلب الرد من محرك غيث الرئيسي
    const replyFromGemini = await askGhaith(messageText, {
      systemInstruction: customSystemInstruction
    });

    // إرسال الرد عبر الواتساب
    await sock.sendMessage(senderJid, { text: replyFromGemini });

    // حفظ الرسالة والرد في السجل
    await logChatMessage(dbPool, senderJid, 'user', messageText);
    await logChatMessage(dbPool, senderJid, 'assistant', replyFromGemini);

  } catch (error) {
    console.error("[غيث Private Service Error]:", error);
  }
}

// ==========================================
// وظائف معالجة الأوامر من رقم التحكم (ADMIN)
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
    await db.query("INSERT INTO ghaith_settings (setting_key, setting_value) VALUES ('is_active', 'true') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'true'");
    await sock.sendMessage(adminJid, { text: "✅ تم تشغيل غيث بنجاح." });
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
    await sock.sendMessage(adminJid, { text: `🚫 تم إضافة الرقم (${phoneToBlock}) إلى قائمة الاستثناءات.` });
    return;
  }

  if (command.startsWith("تفعيل ")) {
    const phoneToUnblock = command.replace("تفعيل ", "").trim();
    await db.query("DELETE FROM ghaith_blacklist WHERE phone_number = $1", [phoneToUnblock]);
    await sock.sendMessage(adminJid, { text: `✅ تم إزالة الاستثناء للرقم (${phoneToUnblock}).` });
    return;
  }

  const helpMenu = `🤖 *لوحة تحكم غيث (الأوامر المتاحة):*\n\n` +
    `• *توقف* : إيقاف البوت كلياً.\n` +
    `• *تشغيل* : إعادة تفعيل البوت.\n` +
    `• *حالة: [النص]* : تحديث حالتك الحالية.\n` +
    `• *استثناء [الرقم]* : حظر رقم من الرد.\n` +
    `• *تفعيل [الرقم]* : إلغاء حظر الرقم.`;
  
  await sock.sendMessage(adminJid, { text: helpMenu });
}

// ==========================================
// وظائف السجل وتلخيص الذاكرة
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

  // تلخيص المحادثة أوتوماتيكياً عند التجاوز لتقليل الاستهلاك
  if (res.rows.length > 12) {
    const fullLog = res.rows.map(r => `${r.role}: ${r.message_text}`).join('\n');
    const summarizePrompt = `قم بتلخيص هذه المحادثة بين المستخدم والمساعد غيث في 3 أسطر مركزة تستخرج أهم النقاط والطلبات:\n\n${fullLog}`;
    
    const summary = await askGhaith(summarizePrompt, {
      systemInstruction: "أنت ملخص احترافي، مهمتك تلخيص المحادثات المرفقة بدقة بدون أي إضافات."
    });

    await db.query('DELETE FROM ghaith_chat_logs WHERE sender_phone = $1', [phone]);
    await logChatMessage(db, phone, 'assistant', `[ملخص المحادثة السابقة]: ${summary}`);

    return `[ملخص المحادثة السابقة]: ${summary}`;
  }

  return res.rows.map(r => `${r.role === 'user' ? 'المستخدم' : 'غيث'}: ${r.message_text}`).join('\n');
}
