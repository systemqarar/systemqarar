import makeWASocket, { useMultiFileAuthState, DisconnectReason, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';

const logger = pino({ level: 'silent' });

class WhatsappService {
  private sock: any = null;
  private isPairingCodeRequested = false; // 🔒 قفل الأمان لمنع تكرار طلب الكود

  async initialize() {
    // إعادة تهيئة قفل الأمان عند كل تشغيل جديد نظيف
    this.isPairingCodeRequested = false;

    const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), 'whatsapp_session'));

    this.sock = makeWASocket({
      auth: state,
      logger,
      printQRInTerminal: false
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('🔴 تم قطع اتصال الواتساب. سبب القطع:', lastDisconnect?.error?.message || lastDisconnect?.error, 'محاولة إعادة الاتصال التلقائي:', shouldReconnect);
        
        if (shouldReconnect) {
          // انتظر قليلاً قبل إعادة المحاولة لتجنب الحظر
          await delay(5000);
          this.initialize();
        }
      } else if (connection === 'open') {
        console.log('🟢 [نجاح مبهر]: تم ربط رقم الواتساب بالنظام بنجاح وهو الآن جاهز للخدمة الحية!');
        this.isPairingCodeRequested = false; // تصغير الراية بعد النجاح
      }

      // 🔒 فحص قفل الأمان: لا تطلب الكود إلا إذا كان الحساب غير مسجل ولَم يتم طلب كود من قبل في هذه الدورة
      if (!this.sock.authState.creds.registered && !this.isPairingCodeRequested) {
        const myPhoneNumber = process.env.MY_WHATSAPP_NUMBER;
        
        if (myPhoneNumber) {
          this.isPairingCodeRequested = true; // تفعيل القفل فوراً لمنع التكرار بالتزامن
          await delay(6000); // مهلة استقرار للسيرفر
          
          try {
            console.log(`⏳ جاري طلب كود الربط الرقمي للرقم: ${myPhoneNumber}...`);
            const pairingCode = await this.sock.requestPairingCode(myPhoneNumber.trim());
            
            console.log('\n=============================================');
            console.log(`🔑 [كود ربط واتساب نظام قرار]: >>> ${pairingCode} <<<`);
            console.log('⏰ الكود مستقر الآن وثابت؛ أدخله في موبايلك براحتك.');
            console.log('=============================================\n');
          } catch (err) {
            console.error('❌ فشل طلب كود الربط الرقمي من واتساب:', err);
            this.isPairingCodeRequested = false; // فتح القفل للمحاولة التالية في حال الفشل الحقيقي
          }
        } else {
          console.log('⚠️ تنبيه: لم يتم طباعة كود الربط لعدم وجود المتغير MY_WHATSAPP_NUMBER في إعدادات ريندر.');
        }
      }
    });
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
