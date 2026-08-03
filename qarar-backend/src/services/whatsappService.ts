import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  delay,
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { handleGroupMessage } from './ghaithGroupHandler';
// 🟢 الاستيراد المتوافق 100% مع ملف db.ts الرئيسي ومساره في config
import db from '../config/db';

const { pool } = db;

const logger = pino({ level: 'silent' });
const SESSION_DIR = path.join(process.cwd(), 'whatsapp_session');

/**
 * 🟢 دالة استرجاع الجلسة من قاعدة البيانات إلى الفولدر المحلي
 */
async function restoreSessionFromDb() {
  try {
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    const res = await pool.query('SELECT key_id, value FROM whatsapp_auth');
    if (res.rows.length > 0) {
      console.log(`📦 [جلسة الواتساب]: جاري استعادة ${res.rows.length} ملفات جلسة من الداتابيز...`);
      for (const row of res.rows) {
        fs.writeFileSync(path.join(SESSION_DIR, row.key_id), row.value, 'utf-8');
      }
      console.log('✅ [جلسة الواتساب]: تم استرجاع الجلسة بنجاح، لن تحتاج لكود ربط جديد!');
    }
  } catch (err) {
    console.error('⚠️ خطأ أثناء استعادة الجلسة من الداتابيز:', err);
  }
}

/**
 * 🟢 دالة حفظ الجلسة من الفولدر المحلي إلى قاعدة البيانات
 */
async function saveSessionToDb() {
  try {
    if (!fs.existsSync(SESSION_DIR)) return;

    const files = fs.readdirSync(SESSION_DIR);
    for (const file of files) {
      const filePath = path.join(SESSION_DIR, file);
      
      try {
        if (!fs.existsSync(filePath)) continue;

        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        await pool.query(
          `INSERT INTO whatsapp_auth (key_id, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key_id) 
           DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [file, content]
        );
      } catch (fileErr) {
        continue;
      }
    }
  } catch (err) {
    console.error('⚠️ خطأ أثناء حفظ الجلسة في الداتابيز:', err);
  }
}

class WhatsappService {
  private sock: any = null;
  private isInitializing = false;

  public getSocket() {
    return this.sock;
  }

  public isConnected(): boolean {
    return !!(this.sock && this.sock.ws && this.sock.ws.readyState === 1);
  }

  async initialize() {
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('⚠️ [تنبيه أمان]: تم إيقاف تفعيل وحدة اتصال الواتساب الحي بنجاح بناءً على طلب الإدارة.');
      return;
    }

    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      await restoreSessionFromDb();

      console.log('📡 جاري جلب أحدث إصدار لواتساب ويب...');
      const { version, isLatest } = await fetchLatestBaileysVersion();
      console.log(`ℹ️ الإصدار المستخدم: v${version.join('.')}, هل هو الأحدث؟ ${isLatest}`);

      const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

      this.sock = makeWASocket({
        version, 
        auth: state,
        logger,
        printQRInTerminal: false,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        // 🛡️ معالجة حماية لمنع انهيار التشفير أثناء تجديد الموديل/المفاتيح
        getMessage: async (key) => {
          return { conversation: '' };
        }
      });

      // حفظ الجلسة فور كل تحديث
      this.sock.ev.on('creds.update', async () => {
        await saveCreds();
        await saveSessionToDb();
      });

      // 🟢 الاستماع للرسائل الواردة وتمريرها لمُعالج القروبات
      this.sock.ev.on('messages.upsert', async (m: any) => {
        try {
          if (m.type === 'notify' && m.messages && m.messages.length > 0) {
            for (const msg of m.messages) {
              // تجنب معالجة رسائل البوت نفسه أو الرسائل الفارغة
              if (msg.key.fromMe) continue;

              // تمرير الرسالة لمُعالج القروبات
              await handleGroupMessage(this.sock, msg);
            }
          }
        } catch (err: any) {
          // التعامل مع أخطاء التشفير المؤقتة بمرونة دون إيقاف السيرفر
          if (err?.message?.includes('Bad MAC') || err?.message?.includes('Session error')) {
            console.warn('⚠️ [تشفير الواتساب]: تم استلام رسالة بمفتاح قديم جارٍ تحديثه تلقائياً...');
          } else {
            console.error('❌ خطأ أثناء استقبال وتمرير رسالة القروب:', err?.message || err);
          }
        }
      });

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`🔴 انقطع اتصال الواتساب المبدئي. كود: ${statusCode}`);

          this.isInitializing = false;
          if (shouldReconnect) {
            console.log('🔄 جاري إعادة الاتصال بالواتساب خلال 10 ثوانٍ...');
            await delay(10000);
            this.initialize();
          } else {
            console.error('❌ تم تسجيل الخروج من جلسة الواتساب. يُرجى إعادة مسح كود QR أو طلب كود ربط جديد.');
          }
        } else if (connection === 'open') {
          console.log('🟢 تم ربط الواتساب بنجاح! نظام قرار الآن جاهز لإرسال واستقبال الرسائل 🎉');
          this.isInitializing = false;
          await saveSessionToDb();
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

  /**
   * 🟢 دالة إرسال الرسائل الخاصة مع إعادة المحاولة
   */
  async sendMessage(targetPhone: string, messageText: string, retries = 2): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        console.error('❌ [قرار - خطأ]: سيرفر الواتساب غير متصل حالياً.');
        return false;
      }

      let formattedNumber = targetPhone.trim().replace(/[\s+]+/g, '');
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '249' + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith('249')) {
        formattedNumber = '249' + formattedNumber;
      }

      const jid = `${formattedNumber}@s.whatsapp.net`;

      const randomSeconds = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
      console.log(`⏱️ [تمويه أمني]: الانتظار لمدة ${randomSeconds / 1000} ثوانٍ...`);
      await delay(randomSeconds);

      console.log(`📡 جاري إرسال الرسالة الآن إلى: ${jid}...`);

      await this.sock.sendMessage(jid, { text: messageText });

      console.log(`✅ تم إرسال الرسالة بنجاح للرقم: ${formattedNumber}`);
      return true;

    } catch (error: any) {
      console.error(`❌ فشل إرسال الرسالة إلى ${targetPhone}:`, error?.message || error);
      
      // إعادة المحاولة في حال انقطاع الشبكة
      if (retries > 0) {
        console.log(`🔄 إعادة محاولة الإرسال لـ ${targetPhone}... (المحاولات المتبقية: ${retries})`);
        await delay(3000);
        return this.sendMessage(targetPhone, messageText, retries - 1);
      }
      return false;
    }
  }
}

export const whatsappService = new WhatsappService();
