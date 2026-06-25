import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  delay,
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';

const logger = pino({ level: 'silent' });

class WhatsappService {
  private sock: any = null;
  private isInitializing = false;

  async initialize() {
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('⚠️ [تنبيه أمان]: تم إيقاف تفعيل وحدة اتصال الواتساب الحي بنجاح بناءً على طلب الإدارة.');
      return;
    }

    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      console.log('📡 جاري جلب أحدث إصدار لواتساب ويب...');
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`ℹ️ الإصدار المستخدم: v${version.join('.')}, هل هو الأحدث؟ ${isLatest}`);

      const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), 'whatsapp_session'));

      this.sock = makeWASocket({
        version, 
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
          console.log('🟢 تم ربط الواتساب بنجاح! نظام قرار الآن جاهز لإرسال الرسائل 🎉');
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

  // 🟢 [التعديل هنا]: الدالة أصبحت عامة ومرنة وتستقبل أي نص رسالة من الكنترولر
  async sendMessage(targetPhone: string, messageText: string): Promise<boolean> {
    try {
      if (!this.sock) {
        console.error('❌ [قرار - خطأ]: سيرفر الواتساب غير متصل حالياً.');
        return false;
      }

      // تنظيف الرقم وتحويله دولي (دي وظيفة سيرفس الواتساب)
      let formattedNumber = targetPhone.trim().replace(/[\s+]+/g, '');
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '249' + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith('249')) {
        formattedNumber = '249' + formattedNumber;
      }

      const jid = `${formattedNumber}@s.whatsapp.net`;

      // التمويه الزمني العشوائي لحماية الشريحة من الحظر
      const randomSeconds = Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000;
      console.log(`⏱️ [تمويه أمني]: الانتظار لمدة ${randomSeconds / 1000} ثوانٍ بشكل عشوائي...`);
      await delay(randomSeconds);

      console.log(`📡 جاري إرسال الرسالة الآن إلى: ${jid}...`);

      // الإرسال الفعلي للنص الممرر
      await this.sock.sendMessage(jid, { text: messageText });

      console.log(`✅ تم إرسال الرسالة بنجاح للرقم: ${formattedNumber}`);
      return true;

    } catch (error) {
      console.error(`❌ فشل إرسال الرسالة إلى ${targetPhone}:`, error);
      return false;
    }
  }
}

export const whatsappService = new WhatsappService();
