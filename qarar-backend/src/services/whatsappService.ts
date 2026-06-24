import makeWASocket, { useMultiFileAuthState, DisconnectReason, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';

const logger = pino({ level: 'silent' });

class WhatsappService {
  private sock: any = null;
  private isInitializing = false; // 🔒 راية أمان لمنع التداخل البرمجي والتكرار العشوائي

  async initialize() {
    // إذا كانت هناك عملية تهيئة تعمل حالياً، اخرج فوراً لمنع التداخل
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      const { state, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), 'whatsapp_session'));

      this.sock = makeWASocket({
        auth: state,
        logger,
        printQRInTerminal: false,
        connectTimeoutMs: 60000, // رفع مهلة الاتصال لـ 60 ثانية لتفادي ضغط سيرفرات ريندر
        defaultQueryTimeoutMs: 0
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log(`🔴 [تنبيه]: انقطع اتصال السوكت المبدئي (كود الحماية: ${statusCode}). إعادة المحاولة: ${shouldReconnect}`);
          
          this.isInitializing = false; // فتح القفل للسماح بإعادة المحاولة النظيفة
          if (shouldReconnect) {
            await delay(10000); // مهلة أمان مريحة جداً قبل إعادة التشغيل
            this.initialize();
          }
        } else if (connection === 'open') {
          console.log('🟢 [نجاح مبهر]: تم ربط رقم الواتساب بنجاح وهو الآن نشط وجاهز للخدمة الحية!');
          this.isInitializing = false;
        }
      });

      // 📡 طلب الكود مباشرة وبسرعة فور إنشاء السوكت وقبل حدوث أي فصل شبكي
      if (!this.sock.authState.creds.registered) {
        const myPhoneNumber = process.env.MY_WHATSAPP_NUMBER;
        
        if (myPhoneNumber) {
          await delay(3000); // 3 ثوانٍ فقط لتجهيز السوكت داخلياً ثم الإطلاق
          console.log(`📡 جاري إرسال طلب رسمي لتوليد كود الربط الرقمي للرقم: ${myPhoneNumber.trim()}`);
          
          const pairingCode = await this.sock.requestPairingCode(myPhoneNumber.trim());
          
          console.log('\n=============================================');
          console.log(`🔑 [كود ربط واتساب نظام قرار]: >>> ${pairingCode} <<<`);
          console.log('⏰ الكود مستقر الآن؛ أدخله في موبايلك لإنهاء الربط.');
          console.log('=============================================\n');
        }
      }

    } catch (error) {
      console.error('❌ خطأ غير متوقع أثناء تهيئة السيرفر:', error);
      this.isInitializing = false;
    }
  }

  async sendOTP(targetPhone: string, otpCode: string): Promise<boolean> {
    const isDevMode = process.env.DEVELOPMENT_MODE === 'true';

    if (isDevMode) {
      console.log(`\n📢 [لوقس وضع التطوير]: تم توليد الرمز (${otpCode}) للرقم (${targetPhone}) بنجاح.`);
      return true;
    }

    if (!this.sock) {
      console.error('❌ خطأ: خدمة الواتساب غير نشطة.');
      return false;
    }

    try {
      const cleanPhone = targetPhone.replace(/[+\s-]/g, '').trim();
      const whatsappJid = `${cleanPhone}@s.whatsapp.net`;
      const messageText = `📜 *نظام قرار لإدارة وحدة الكلاكلة شرق الإدارية*\n\nأهلاً بك يا متطوع، رمز التحقق الخاص بتفعيل حسابك الموحد هو:\n\n🔑 الرمز: *${otpCode}*\n\n⏰ الرمز صالح لمدة 5 دقائق فقط. يرجى عدم مشاركته مع أي شخص لأمان حسابك الميداني.`;

      await this.sock.sendMessage(whatsappJid, { text: messageText });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const whatsappService = new WhatsappService();
