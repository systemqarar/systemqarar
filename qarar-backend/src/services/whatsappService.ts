import makeWASocket, { useMultiFileAuthState, DisconnectReason, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';

// إعداد مسجل تقارير صامت تماماً لمنع إزعاج اللوقس
const logger = pino({ level: 'silent' });

class WhatsappService {
  private sock: any = null;

  async initialize() {
    // 1. تحديد مسار حفظ ملفات الجلسة
    const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), 'whatsapp_session'));

    // 2. إنشاء سوكيت الاتصال
    this.sock = makeWASocket({
      auth: state,
      logger,
      printQRInTerminal: false
    });

    // 3. حفظ التحديثات الأمنية للجلسة
    this.sock.ev.on('creds.update', saveCreds);

    // 4. مراقبة حالة الاتصال (فقط للطباعة وإعادة الاتصال عند السقوط الحقيقي)
    this.sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`🔴 [تنبيه]: انقطع اتصال السوكت المبدئي (كود: ${statusCode}). إعادة المحاولة: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          // تأخير أمان لمدة 10 ثوانٍ كاملة قبل إعادة التشغيل لحماية الحساب من الحظر الرقمي
          await delay(10000);
          this.initialize();
        }
      } else if (connection === 'open') {
        console.log('🟢 [نجاح مبهر]: تم ربط رقم الواتساب بنجاح وهو الآن نشط وجاهز للخدمة الحية!');
      }
    });

    // 5. 🔒 [منطقة الأمان المركزية]: طلب كود الـ 8 أرقام يتم هنا "مرة واحدة فقط" عند إقلاع السيرفر
    if (!this.sock.authState.creds.registered) {
      const myPhoneNumber = process.env.MY_WHATSAPP_NUMBER;
      
      if (myPhoneNumber) {
        // نمنح السيرفر في ريندر 10 ثوانٍ كاملة لفتح الـ WebSocket واستقراره قبل طلب الكود
        console.log(`⏳ [انتظار]: جاري تهيئة خط الاتصال المستقر مع واتساب...`);
        await delay(10000);
        
        try {
          console.log(`📡 جاري إرسال طلب رسمي لتوليد كود الربط الرقمي للرقم: ${myPhoneNumber.trim()}`);
          const pairingCode = await this.sock.requestPairingCode(myPhoneNumber.trim());
          
          console.log('\n=============================================');
          console.log(`🔑 [كود ربط واتساب نظام قرار]: >>> ${pairingCode} <<<`);
          console.log('⏰ الكود ثابت ومستقر الآن في السيرفر بانتظار إدخاله في موبايلك.');
          console.log('=============================================\n');
        } catch (err: any) {
          console.error('❌ [خطأ]: فشل سيرفر واتساب في تزويدنا بكود الربط حالياً، السبب:', err?.message || err);
        }
      } else {
        console.log('⚠️ تنبيه: لم يتم طلب كود الربط لعدم وجود المتغير MY_WHATSAPP_NUMBER في إعدادات ريندر.');
      }
    }
  }

  async sendOTP(targetPhone: string, otpCode: string): Promise<boolean> {
    const isDevMode = process.env.DEVELOPMENT_MODE === 'true';

    if (isDevMode) {
      console.log(`\n📢 [لوقس وضع التطوير]: تم توليد الرمز (${otpCode}) للرقم (${targetPhone}) بنجاح.`);
      return true;
    }

    if (!this.sock) {
      console.error('❌ خطأ: خدمة الواتساب غير نشطة أو غير متصلة حالياً بالسيرفر.');
      return false;
    }

    try {
      const cleanPhone = targetPhone.replace(/[+\s-]/g, '').trim();
      const whatsappJid = `${cleanPhone}@s.whatsapp.net`;
      const messageText = `📜 *نظام قرار لإدارة وحدة الكلاكلة شرق الإدارية*\n\nأهلاً بك يا متطوع، رمز التحقق الخاص بتفعيل حسابك الموحد هو:\n\n🔑 الرمز: *${otpCode}*\n\n⏰ الرمز صالح لمدة 5 دقائق فقط. يرجى عدم مشاركته مع أي شخص لأمان حسابك الميداني.`;

      await this.sock.sendMessage(whatsappJid, { text: messageText });
      console.log(`✅ تم إرسال رسالة الـ OTP بنجاح عبر الواتساب الحي إلى الرقم: ${targetPhone}`);
      return true;
    } catch (error) {
      console.error(`❌ فشل تقني أثناء محاولة إرسال الرسالة الحية للرقم ${targetPhone}:`, error);
      return false;
    }
  }
}

export const whatsappService = new WhatsappService();
