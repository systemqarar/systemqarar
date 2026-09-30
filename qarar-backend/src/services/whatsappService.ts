// src/services/whatsappService.ts

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
import { handlePrivateChatMessage, loadGhaithSettings } from './ghaithPrivateService';
import db from '../config/db';

const { pool } = db;

const logger = pino({ level: 'silent' });
const SESSION_DIR = path.join(process.cwd(), 'whatsapp_session');

// 🛡️ ذاكرة مؤقتة لمنع تكرار معالجة نفس الرسالة
const processedMessageIds = new Set<string>();

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
  private startTime: number = Math.floor(Date.now() / 1000);

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
    this.startTime = Math.floor(Date.now() / 1000);

    try {
      await restoreSessionFromDb();
      await loadGhaithSettings(pool); // تحميل إعدادات غيث من الداتابيز

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
        keepAliveIntervalMs: 25000
      });

      this.sock.ev.on('creds.update', async () => {
        await saveCreds();
        await saveSessionToDb();
      });

      // 🟢 استقبال وتوجيه الرسائل
      this.sock.ev.on('messages.upsert', async (m: any) => {
        try {
          if (!m.messages || m.messages.length === 0) return;

          for (const msg of m.messages) {
            // تجاهل الرسائل الفارغة أو رسائل النظام الأوتوماتيكية
            if (!msg.message) continue;

            const remoteJid = msg.key.remoteJid || '';

            // 1. معالجة حساب الوقت بمرونة دون تجاهل الرسائل
            let rawTime = msg.messageTimestamp;
            if (typeof rawTime === 'object' && rawTime !== null) {
              rawTime = rawTime.low || rawTime.unsigned || 0;
            }
            const msgTimestamp = Number(rawTime) || 0;

            // إذا كانت الرسالة قديمة جداً (أكثر من 5 دقائق قبل تشغيل السيرفر)، نتجاهلها
            if (msgTimestamp > 0 && msgTimestamp < (this.startTime - 300)) {
              continue;
            }

            // 2. منع تكرار معالجة نفس المعرف
            const msgId = msg.key.id;
            if (msgId) {
              if (processedMessageIds.has(msgId)) continue;
              processedMessageIds.add(msgId);
              
              if (processedMessageIds.size > 1000) {
                const firstItem = processedMessageIds.values().next().value;
                if (firstItem) processedMessageIds.delete(firstItem);
              }
            }

            console.log(`📩 [رسالة واردة جديدة] من: ${remoteJid}`);

            // 👥 التوجيه للقروبات
            if (remoteJid.endsWith('@g.us')) {
              await handleGroupMessage(this.sock, msg);
            } 
            // 👤 التوجيه للدردشات الخاصة (تدعم @s.whatsapp.net و @lid)
            else if (remoteJid.endsWith('@s.whatsapp.net') || remoteJid.endsWith('@lid')) {
              console.log(`🤖 جاري تحويل الرسالة للخدمة الخاصة بغيث...`);
              await handlePrivateChatMessage(this.sock, msg, pool);
            }
          }
        } catch (err: any) {
          if (err?.message?.includes('Bad MAC') || err?.message?.includes('Session error')) {
            console.warn('⚠️ [تشفير الواتساب]: جاري تحديث المفتاح تلقائياً...');
          } else {
            console.error('❌ خطأ أثناء معالجة الرسالة في whatsappService:', err?.message || err);
          }
        }
      });

      this.sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`🔴 انقطع الاتصال. كود: ${statusCode}`);

          this.isInitializing = false;
          if (shouldReconnect) {
            console.log('🔄 جاري إعادة الاتصال خلال 10 ثوانٍ...');
            await delay(10000);
            this.initialize();
          } else {
            console.error('❌ تم تسجيل الخروج. يرجى مسح كود QR جديد.');
          }
        } else if (connection === 'open') {
          console.log('🟢 تم ربط الواتساب بنجاح! غيث جاهز للرد 🎉');
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
   * 🟢 دالة إرسال الرسائل
   */
  async sendMessage(targetPhone: string, messageText: string, retries = 2): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        console.error('❌ [خطأ]: السيرفر غير متصل.');
        return false;
      }

      let formattedNumber = targetPhone.trim().replace(/[\s+]+/g, '');
      const jid = formattedNumber.includes('@s.whatsapp.net') 
        ? formattedNumber 
        : `${formattedNumber}@s.whatsapp.net`;

      const randomSeconds = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
      await delay(randomSeconds);

      console.log(`📡 جاري إرسال الرسالة إلى: ${jid}...`);
      await this.sock.sendMessage(jid, { text: messageText });

      console.log(`✅ تم الإرسال بنجاح إلى: ${formattedNumber}`);
      return true;

    } catch (error: any) {
      console.error(`❌ فشل الإرسال إلى ${targetPhone}:`, error?.message || error);
      
      if (retries > 0) {
        await delay(2000);
        return this.sendMessage(targetPhone, messageText, retries - 1);
      }
      return false;
    }
  }
}

export const whatsappService = new WhatsappService();