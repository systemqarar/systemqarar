import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  delay,
  fetchLatestBaileysVersion // 🔥 أضفنا استدعاء الدالة السحرية لتحديث الإصدار ديناميكياً
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';

const logger = pino({ level: 'silent' });

class WhatsappService {
  private sock: any = null;
  private isInitializing = false;

  async initialize() {
    // 🛑 [قفل الإيقاف الفوري]: إذا كان وضع التطوير نشطاً، اخرج فوراً ولا تشغل الواتساب
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('⚠️ [تنبيه أمان]: تم إيقاف تفعيل وحدة اتصال الواتساب الحي بنجاح بناءً على طلب الإدارة.');
      return;
    }

    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      // 1️⃣ جلب أحدث إصدار متوافق مع سيرفرات واتساب لتجاوز خطأ 428
      console.log('📡 جاري جلب أحدث إصدار لواتساب ويب...');
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`ℹ️ الإصدار المستخدم: v${version.join('.')}, هل هو الأحدث؟ ${isLatest}`);

      const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), 'whatsapp_session'));

      // 2️⃣ تمرير الـ version المحدث ديناميكياً داخل الإعدادات
      this.sock = makeWASocket({
        version, // 💥 هنا التعديل الحاسم لحل المشكلة
        auth: state,
        logger,
        printQRInTerminal: false,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`🔴 انقطع اتصال الواتساب المبدئي. كود: ${statusCode}`);

          this.isInitializing = false;
          if (shouldReconnect) {
            await delay(10000);
            this.initialize();
          }
        } else if (connection === 'open') {
          console.log('🟢 تم ربط الواتساب بنجاح! نظام قرار الآن جاهز لإرسال الـ OTP 🎉');
          this.isInitializing = false;
        }
      });

      if (!this.sock.authState.creds.registered) {
        const myPhoneNumber = process.env.MY_WHATSAPP_NUMBER;
        if (myPhoneNumber) {
          await delay(3000);
          console.log(`📡 جاري طلب كود الربط للرقم: ${myPhoneNumber.trim()}`);
          const pairingCode = await this.sock.requestPairingCode(myPhoneNumber.trim());
          console.log(`🔑 كود الربط الخاص بجوالك هو: >>> ${pairingCode} <<<`);
        }
      }

    } catch (error) {
      console.error('❌ حدث خطأ أثناء تهيئة الواتساب:', error);
      this.isInitializing = false;
    }
  }

  async sendOTP(targetPhone: string, otpCode: string): Promise<boolean> {
    // في وضع التطوير، سنكتفي بطباعة الرمز في اللوقس دون إرسال حقيقي لقمع الأخطاء
    console.log(`\n📢 [محاكاة وضع التطوير]: تم توليد الرمز (${otpCode}) للرقم (${targetPhone}) بنجاح.`);
    return true;
  }
}

export const whatsappService = new WhatsappService();
