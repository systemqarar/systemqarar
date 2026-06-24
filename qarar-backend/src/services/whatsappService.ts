import makeWASocket, { useMultiFileAuthState, DisconnectReason, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';

// إعداد مسجل تقارير خفيف ومخفي لمنع تشتيت اللوقس في ريندر
const logger = pino({ level: 'silent' });

class WhatsappService {
  private sock: any = null;

  /**
   * 🚀 دالة تشغيل وربط الواتساب بالنظام لأول مرة
   */
  async initialize() {
    // 1. تحديد مكان حفظ ملفات الجلسة وأمان الربط في المجلد الرئيسي للباكيند
    const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), 'whatsapp_session'));

    // 2. إنشاء نسخة اتصال الواتساب (بدون طباعة المربع الافتراضي QR)
    this.sock = makeWASocket({
      auth: state,
      logger,
      printQRInTerminal: false
    });

    // 3. أمر حفظ التحديثات الأمنية للجلسة تلقائياً
    this.sock.ev.on('creds.update', saveCreds);

    // 4. مراقبة وتتبع حالة الاتصال حياً
    this.sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('🔴 تم قطع اتصال الواتساب. سبب القطع:', lastDisconnect?.error, 'محاولة إعادة الاتصال التلقائي:', shouldReconnect);
        if (shouldReconnect) {
          this.initialize(); // إعادة تشغيل الاتصال تلقائياً في حال حدوث هبوط بالشبكة
        }
      } else if (connection === 'open') {
        console.log('🟢 [نجاح مبهر]: تم ربط رقم الواتساب بالنظام بنجاح وهو الآن جاهز للخدمة الحية!');
      }

      // 5. آلية توليد كود الـ 8 أرقام (Pairing Code) للموبايل إذا لم يكن الحساب مربوطاً بعد
      if (!this.sock.authState.creds.registered) {
        const myPhoneNumber = process.env.MY_WHATSAPP_NUMBER;
        
        if (myPhoneNumber) {
          await delay(6000); // مهلة أمان قصيرة لتهيئة السيرفر قبل طلب الكود
          try {
            // طلب الكود المكون من 8 أرقام من خوادم واتساب الرسمية للرقم المحدد
            const pairingCode = await this.sock.requestPairingCode(myPhoneNumber.trim());
            console.log('\n=============================================');
            console.log(`🔑 [كود ربط واتساب نظام قرار]: >>> ${pairingCode} <<<`);
            console.log('=============================================\n');
          } catch (err) {
            console.error('❌ فشل طلب كود الربط الرقمي من واتساب:', err);
          }
        } else {
          console.log('⚠️ تنبيه: لم يتم طباعة كود الربط لعدم وجود المتغير MY_WHATSAPP_NUMBER في إعدادات ريندر.');
        }
      }
    });
  }

  /**
   * 💬 دالة إرسال الرمز (OTP) للمتطوعين أو طباعته في اللوقس حسب وضع التطوير
   */
  async sendOTP(targetPhone: string, otpCode: string): Promise<boolean> {
    const isDevMode = process.env.DEVELOPMENT_MODE === 'true';

    // 🅰️ إذا كان وضع التطوير مفعلاً: نكتفي بالطباعة في السجلات لحماية الخصوصية ومنع المزعجين
    if (isDevMode) {
      console.log(`\n📢 [لوقس وضع التطوير]: تم توليد الرمز (${otpCode}) للرقم (${targetPhone}) بنجاح.`);
      return true;
    }

    // 🅱️ إذا كان النظام في الوضع الحي الحقيقي:
    if (!this.sock) {
      console.error('❌ خطأ: خدمة الواتساب غير نشطة أو غير متصلة حالياً بالسيرفر.');
      return false;
    }

    try {
      // تجهيز صيغة الرقم البرمجية المتوافقة مع سيرفرات واتساب الدولية
      const cleanPhone = targetPhone.replace(/[+\s-]/g, '').trim();
      const whatsappJid = `${cleanPhone}@s.whatsapp.net`;

      // نص الرسالة الرسمي والمنظم المتطابق مع تذكرة التنفيذ
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

// تصدير نسخة موحدة ومركزية من الخدمة الجاهزة للاستدعاء في أي موديول
export const whatsappService = new WhatsappService();
