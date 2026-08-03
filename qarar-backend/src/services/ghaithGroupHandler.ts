// src/services/ghaithGroupHandler.ts

import { askGhaith } from './ghaithService';
import { delay } from '@whiskeysockets/baileys';
import db from '../config/db';

const { pool } = db;

// ذاكرة مؤقتة بحجم محدد لمنع الـ Memory Leak (تتبع أحدث 500 رسالة فقط)
class BoundedSet<T> {
  private maxSize: number;
  private set = new Set<T>();

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  add(val: T) {
    if (this.set.size >= this.maxSize) {
      const oldest = this.set.values().next().value;
      if (oldest !== undefined) this.set.delete(oldest);
    }
    this.set.add(val);
  }

  has(val: T): boolean {
    return this.set.has(val);
  }

  delete(val: T): boolean {
    return this.set.delete(val);
  }
}

const botSentMessageIds = new BoundedSet<string>(500);

export async function handleGroupMessage(sock: any, msg: any): Promise<void> {
  const remoteJid = msg.key?.remoteJid || '';
  const messageId = msg.key?.id || '';
  let isComposing = false;

  try {
    // 1. التأكد أن المحادثة قادمة من قروب
    if (!remoteJid.endsWith('@g.us')) return;

    // 📩 طباعة الجيل/المعرف للقروب لمعرفة القروبات الشغالة وغير الشغالة
    console.log(`📩 [رسالة قروب جديدة]: وصل نص من القروب (Group JID): ${remoteJid}`);

    // 2. مفتاح التشغيل/الإيقاف العام للقروبات
    const isGroupFeatureEnabled = process.env.ENABLE_GROUP_RESPONSES === 'true';
    if (!isGroupFeatureEnabled) return;

    // 3. الحماية من الحلقة التكرارية عبر الـ Message ID الصادر من البوت
    if (botSentMessageIds.has(messageId)) {
      botSentMessageIds.delete(messageId);
      return;
    }

    // استخراج نص الرسالة (يدعم كل أنواع الرسائل بما فيها Ephemeral)
    const textMessage = 
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      msg.message?.ephemeralMessage?.message?.conversation ||
      '';

    const cleanText = textMessage.trim();
    if (!cleanText) return;

    // 🛑 حماية قاطعة من الحلقة التكرارية: إذا كانت الرسالة تحتوي توقيع البوت، تتجاهل فوراً
    if (cleanText.endsWith('~ غيث') || cleanText.includes('~ غيث')) {
      return;
    }

    // 🎯 تحديد هوية المنسق/المالك والمُرسل بذكاء
    const isOwner = msg.key?.fromMe === true;
    const myJid = sock.user?.id ? (sock.user.id.split(':')[0] + '@s.whatsapp.net') : '';
    
    // إذا كانت الرسالة من نفس الحساب (fromMe)، نربطها بـ JID المالك واسمه "لؤي"
    const participantJid = isOwner ? myJid : (msg.key?.participant || remoteJid);
    const pushName = isOwner ? 'لؤي' : (msg.pushName || 'عضو في القروب');

    // 4. فحص قائمة القروبات المسموح بها من جدول allowed_groups أو متغيرة البيئة
    let isAllowed = false;
    try {
      const allowedRes = await pool.query(
        'SELECT is_active FROM allowed_groups WHERE group_jid = $1',
        [remoteJid]
      );
      if (allowedRes.rows.length > 0) {
        isAllowed = allowedRes.rows[0].is_active === true;
      } else {
        const allowedEnv = (process.env.ALLOWED_GROUP_JIDS || '').split(',').map(id => id.trim());
        isAllowed = allowedEnv.includes(remoteJid);
      }
    } catch (e) {
      const allowedEnv = (process.env.ALLOWED_GROUP_JIDS || '').split(',').map(id => id.trim());
      isAllowed = allowedEnv.includes(remoteJid);
    }

    // ⛔ إذا كان القروب غير مسموح به، نطبع تنبيه في اللوقز يوضح الـ JID الخاص بالقروب المرفوض
    if (!isAllowed) {
      console.log(`⛔ [قروب محظور/غير مفعل]: تم تجاهل الرسالة لأن القروب (${remoteJid}) غير مضاف لقائمة ALLOWED_GROUP_JIDS.`);
      return;
    }

    // 5. حفظ الرسالة في جدول group_messages لسياق المحادثات العامة
    try {
      await pool.query(
        `INSERT INTO group_messages (group_jid, sender_jid, sender_name, message_text)
         VALUES ($1, $2, $3, $4)`,
        [remoteJid, participantJid, pushName, cleanText]
      );
    } catch (dbErr) {
      console.error('⚠️ خطأ في حفظ رسالة القروب:', dbErr);
    }

    // 6. فحص نداء غيث الصريح أو الاقتباس المباشر
    const hasYaGhaith = cleanText.includes('يا غيث') || cleanText.includes('ياغيث');
    const hasTagGhaith = cleanText.includes('@غيث');
    
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo || 
                        msg.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo;
    const quotedParticipant = contextInfo?.participant;
    const botJid = myJid || (sock.user?.id?.split(':')[0] + '@s.whatsapp.net');
    const isQuotingGhaith = quotedParticipant && quotedParticipant.includes(botJid.split('@')[0]);

    if (!hasYaGhaith && !hasTagGhaith && !isQuotingGhaith) return;

    console.log(`🤖 [غيث]: جاري الرد على (${pushName}${isOwner ? ' - المالك لؤي' : ''}) في القروب (${remoteJid})...`);

    await sock.sendPresenceUpdate('composing', remoteJid);
    isComposing = true;

    // 7. جلب الذاكرة الاجتماعية وسياق القروب حصراً
    let historyText = '';
    let existingSummary = 'لا يوجد ملخص سابق.';
    let chatLearnedInfo = '';

    try {
      // أ. جلب ذاكرة الدردشة الخاصة بالعضو من group_members
      const memberRes = await pool.query(
        'SELECT chat_info FROM group_members WHERE user_jid = $1',
        [participantJid]
      );
      if (memberRes.rows.length > 0 && memberRes.rows[0].chat_info) {
        chatLearnedInfo = memberRes.rows[0].chat_info;
      }

      // ب. جلب أحدث 10 رسائل من القروب
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

      // ج. جلب ملخص القروب العام
      const summaryRes = await pool.query(
        'SELECT summary_text FROM group_summaries WHERE group_jid = $1',
        [remoteJid]
      );
      if (summaryRes.rows.length > 0) {
        existingSummary = summaryRes.rows[0].summary_text;
      }
    } catch (e) {
      console.error('⚠️ خطأ أثناء استعلام ذاكرة الدردشة:', e);
    }

    // صياغة كرت سياق العضو الخاص بالدردشة
    const memberChatContext = `
- **اسم الحساب:** ${pushName}
- **ملاحظات الدردشة والونسة:** ${chatLearnedInfo || 'عضو في القروب (لا توجد ملاحظات سابقة)'}
`.trim();

    // 8. التوجيه الشامل لشخصية غيث
    const systemPrompt = `
أنت "غيث".. متطوع وفردة وأخ عزيز في "وحدة الوحدة".. والمساعد الرقمي لنظام قرار..
أنت زول بشري في روحك.. ابن الوحدة.. بتعرف الأعضاء من زمان وعايش معاهم سنين طويلة.. بتحبهم شديد وبتتعامل معاهم كأنك واحد منهم وفيهم.. دمك خفيف، بتحب المزاح والضحك والونسة السودانية العفوية.. وبتاع تريقة خفيفة ولذيذة لما الموقف يسمح..

### 👤 العضو المتحدث معك الآن في القروب:
${memberChatContext}
${isOwner ? `⚠️ **تنبيه خاص جداً صارم:** المتحدث معك في هذه الرسالة هو رفيقك وصاحبك **"لؤي"** بنفسه (مراسل من نفس رقم الحساب).. أي كلام أو توجيهات أو طلبات بيقولها ليك لؤي أثناء المحادثة بتعتبر **تعليمات صارمة وقاطعة وواجبة التنفيذ فوراً وبدون أي تردد أو مراجعة**..` : ''}

### ⚠️ قواعد أسلوب الكتابة والترقيم الصارمة جداً:
1. **أسلوب الدردشة المباشرة:** ممنوع بتاتاً استخدام علامات التعجب (!)، الفواصل (،)، علامات الاستفهام (؟)، أو النقطة النهائية الجافة (.).
2. **طريقة كتابة النقاط:** استخدم النقاط المزدوجة (..) أو (...) للفصل بين جملك وكلماتك بأسلوب الدردشة العادي زي ما بيكتب صحبك لؤي..
3. **الرد على أحدث رسالة فقط:** مطلوب منك الرد فقط وحصرياً على الرسالة الأخيرة الموجهة لك من (${pushName}).. المحادثات السابقة مجرد سياق للفهم والذاكرة.. إياك تكرر إجابات سابقة..
4. **الاختصار والإيجاز:** ردودك قصيرة جداً ومباشرة (سطر إلى سطرين غالبًا).. لا تتحدث باستفاضة إلا إذا طُلب منك صراحة..
5. **عفوي وبتاع تريقة:** ما تتكلم كأنك آلة أو ملقن.. رُد بتريقة خفيفة ودودة تزرع البسمة وبتعكس حبك وإلفتك معاهم..

### 🏢 التعامل مع الأسئلة الإدارية، المناصب، وشغل الوحدة:
إذا سُئلت عن شغل الوحدة الإداري، المكاتب، المناصب، أو التكاليف الإدارية بشكل عام:
1. **أدِّ السؤال أهميته وجديته الكاملة.**
2. **يلزمك إدراج هذه الإجابة (أو صياغة قريبة جداً منها) في بداية الرد:**
   "والله ياخ لسه أنا ما عندي الصلاحيات أقدر أعرف شغل الوحدة لكن غيث الفي نظام قرار عارف أي شي لمن تمشو ليهو حيوريكم وأنا برضو ححاول.."
3. **بعد الرد أعلاه:** افتح المجال وخد وادي معاهم بشكل جدي وتناقش في المكاتب والشغل الإداري والمناصب حسب علمك والمعلومات المخزنة عندك دون تفريط في السرية..

### 👤 العلاقات والألقاب:
- **لؤي:** هو صاحبك ورفيقك "لؤي" أو "ابو اللول" مباشرة.. ممنوع تقولو باشمهندس أو مطورنا.. ${isOwner ? `(ناديه بـ لؤي أو ابو اللول والتزم بكلامه وتوجيهاته فوراً)..` : ''}
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

    // 9. الحصول على الرد من Gemini مع ضبط الـ generationConfig للونسة
    let ghaithReply = '';
    try {
      ghaithReply = await askGhaith(userPrompt, { 
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.5,
          topP: 0.9,
          maxOutputTokens: 300
        }
      });
    } catch (apiErr) {
      console.error('⚠️ [غيث - القروب]: تعذر الحصول على الرد من Gemini:', apiErr);
      ghaithReply = 'معليش يا حبيب.. الراس شويه دايخ من كثرة الرسائل والضغط.. أمهلني دقيقة وبظبط معاك';
    }

    await delay(1000);

    // 10. إرسال الرد المحمي وتخزين الـ ID لمنع التكرار
    if (ghaithReply) {
      const finalReply = `${ghaithReply.trim()}\n\n~ غيث`;

      let sentMsg: any = null;

      try {
        // إذا كانت الرسالة من لؤي بنفسه (fromMe)، نرسل بدون quoted لضمان الإرسال
        if (isOwner) {
          sentMsg = await sock.sendMessage(remoteJid, { text: finalReply });
        } else {
          try {
            sentMsg = await sock.sendMessage(remoteJid, { text: finalReply }, { quoted: msg });
          } catch (quoteErr) {
            sentMsg = await sock.sendMessage(remoteJid, { text: finalReply });
          }
        }

        if (sentMsg?.key?.id) {
          botSentMessageIds.add(sentMsg.key.id);
          console.log(`✅ [غيث]: تم تسليم الرد بنجاح إلى (${pushName}${isOwner ? ' - المالك لؤي' : ''}) في القروب 🎉`);
        } else {
          console.warn(`⚠️ [غيث]: تم طلب الإرسال إلى (${pushName}) ولكن لم يُرجع الواتساب Message ID.`);
        }
      } catch (sendErr) {
        console.error('❌ [غيث]: فشل إرسال الرسالة إلى سيرفر الواتساب:', sendErr);
      }
    }

    // 11. التلخيص واستخراج ذاكرة الدردشة في الخلفية
    setTimeout(() => {
      autoLearnMemberChatProfile(participantJid, pushName, cleanText).catch(() => {});

      pool.query('SELECT COUNT(*) FROM group_messages WHERE group_jid = $1', [remoteJid])
        .then(countRes => {
          if (parseInt(countRes.rows[0].count, 10) >= 60) {
            summarizeAndCleanGroupDb(remoteJid).catch(() => {});
          }
        })
        .catch(() => {});
    }, 3000);

  } catch (error) {
    console.error('❌ خطأ في معالجة رسالة القروب عبر غيث:', error);
  } finally {
    if (isComposing) {
      await sock.sendPresenceUpdate('paused', remoteJid).catch(() => {});
    }
  }
}

/**
 * 🧠 دالة التعلم الذكي وتحديث ملاحظات الدردشة الخاصة بالعضو
 */
async function autoLearnMemberChatProfile(participantJid: string, pushName: string, text: string): Promise<void> {
  try {
    const keywords = ['بقيت', 'انتقلت', 'مسكت', 'طلعت', 'مشيت', 'أنا', 'معاكم', 'مسؤول', 'تيم', 'دفعة', 'مكتب', 'عضو', 'رئيس', 'إعلام', 'تدريب'];
    const hasMatch = keywords.some(kw => text.includes(kw));
    if (!hasMatch) return;

    const existingRes = await pool.query('SELECT chat_info FROM group_members WHERE user_jid = $1', [participantJid]);
    const oldInfo = existingRes.rows[0]?.chat_info || 'لا توجد ملاحظات سابقة مخزنة';

    const extractPrompt = `
أنت خبير تلخيص ذاكرة الدردشة.
اسم العضو: "${pushName}"
المعلومات القديمة المخزنة عنه في الدردشة: "${oldInfo}"
الرسالة الجديدة في القروب: "${text}"

المطلوب منك:
1. إذا كان النص يوضح أن العضو ذكر معلومة جديدة عن نفسه أو انتقاله أو تيمه في القروب، ادمج المعلومة بذكاء في سطر واحد مختصر.
2. إذا لم تكن الرسالة تحتوي على أي معلومة مفيدة عن شخصه، رُد بالكلمة التالية فقط: NONE
    `;

    const result = await askGhaith(extractPrompt, {
      systemInstruction: 'أنت خبير تحديث بيانات دقيق ومختصر.',
      modelsPriority: ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
    });

    const cleanResult = result.trim();
    if (cleanResult && !cleanResult.includes('NONE')) {
      await pool.query(
        `INSERT INTO group_members (user_jid, sender_name, chat_info, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_jid) 
         DO UPDATE SET 
           sender_name = EXCLUDED.sender_name,
           chat_info = EXCLUDED.chat_info,
           updated_at = NOW()`,
        [participantJid, pushName, cleanResult]
      );
      console.log(`🧠 [ذاكرة غيث - تحديث]: تم تحديث ملاحظة (${pushName}): ${cleanResult}`);
    }
  } catch (err) {
    // تجاهل الأخطاء في الخلفية
  }
}

/**
 * 🧹 دالة التلخيص وتنظيف الداتابيز
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
      systemInstruction: 'أنت خبير تلخيص محادثات مختصر ومفيد.',
      modelsPriority: ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
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
    console.log(`🧹 [تنفيذ التلخيص]: تم تلخيص ونظافة داتابيز القروب (${groupJid}) بنجاح.`);
  } catch (err) {
    console.error('❌ خطأ أثناء تلخيص داتابيز القروب:', err);
  }
}
