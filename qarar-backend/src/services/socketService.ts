import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import pool from '../config/db'; 

// 🌐 1. تعريف واجهات الأحداث (Strongly Typed Events) للتطوير المستقبلي الآمن
// تضمن عدم كتابة أسماء أحداث خاطئة في الفرونتد أو الباكيند
interface ServerToClientEvents {
  active_users_update: (users: ActiveUserRow[]) => void;
}

interface ClientToServerEvents {
  // هنا تضع أي أحداث يرسلها العميل مستقبلاً (مثل: send_message أو start_quiz)
}

interface InterServerEvents {
  // مفيدة جداً مستقبلاً في حال احتجت لربط السيرفر بـ Redis لموازنة الأحمال (Scaling)
}

// 🔑 2. واجهة بيانات جلسة الاتصال (Socket Metadata)
// الطريقة الرسمية في Socket.io لحفظ بيانات الجلسة دون تدمير كائنات النظام بـ Casting
interface SocketData {
  userId: string;
}

// واجهة تطابق تماماً بنية الصفوف الراجعة من قاعدة البيانات
export interface ActiveUserRow {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  full_name: string;
  secure_photo_url: string | null;
  photo_url: string | null;
}

export class SocketService {
  // تهيئة سيرفر السوكت بالأنواع الصارمة المحددة بالأعلى
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

  public initialize(server: http.Server): void {
    this.io = new Server(server, {
      cors: {
        origin: '*', // يمكن حصرها في بيئة الإنتاج بروابط محددة لمزيد من الأمان
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // 🛡️ برمجية وسيطة آمنة (Strict Middleware) للتحقق من الهوية وحفظ الـ UUID
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        
        // 💡 طباعة محتويات التوكن الحقيقية في سجلات السيرفر لمراقبة الأمان وتسهيل المتابعة
        console.log('🗝️ [SOCKET JWT DECODED]:', decoded);

        // جلب المعرّف بشكل مرن ومقاوم للتغيرات المستقبلية في نظام تسجيل الدخول
        const userId = decoded.id || decoded.user_id || decoded.userId || decoded.sub;

        if (!userId) {
          console.warn('⚠️ [SOCKET]: تم التحقق من صلاحية التوكن بنجاح، لكن لم يتم العثور على أي معرف مستخدم (id/user_id) بداخله.');
          return next(new Error('Authentication error: User ID missing in token'));
        }

        // 💡 حفظ الـ UUID داخل كائن data المخصص رسمياً في مكتبة Socket.io
        socket.data.userId = userId; 
        next();
      } catch (err) {
        console.error('❌ [SOCKET AUTH ERROR]: خطأ أثناء التحقق من التوكن:', err);
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    // الاستماع للاتصالات المستقرة والناجحة
    this.io.on('connection', async (socket) => {
      const userId = socket.data.userId;
      const socketId = socket.id;

      if (userId) {
        console.log(`🟢 [SOCKET CONNECTED]: مستخدم متصل UUID: ${userId} | Socket ID: ${socketId}`);
        await this.setUserOnline(userId, socketId);
        await this.broadcastActiveUsers();
      }

      socket.on('disconnect', async () => {
        console.log(`🔴 [SOCKET DISCONNECTED]: انقطع اتصال Socket ID: ${socketId}`);
        await this.setUserOffline(socketId);
        await this.broadcastActiveUsers();
      });
    });
  }

  // 🟢 تحديث حالة المستخدم في قاعدة البيانات إلى "متصل الآن"
  private async setUserOnline(userId: string, socketId: string): Promise<void> {
    const query = `
      INSERT INTO user_presence (user_id, is_online, socket_id, last_seen)
      VALUES ($1, true, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET is_online = true, socket_id = $2, last_seen = NOW();
    `;
    try {
      await pool.query(query, [userId, socketId]);
    } catch (err) {
      console.error('❌ [SOCKET DB ERROR]: فشل تحديث حالة المتصل أونلاين:', err);
    }
  }

  // 🔴 تحديث حالة المستخدم إلى "غير متصل" عند قطع الاتصال
  private async setUserOffline(socketId: string): Promise<void> {
    const query = `
      UPDATE user_presence
      SET is_online = false, socket_id = NULL, last_seen = NOW()
      WHERE socket_id = $1;
    `;
    try {
      await pool.query(query, [socketId]);
    } catch (err) {
      console.error('❌ [SOCKET DB ERROR]: فشل تحديث حالة المتصل أوفلاين:', err);
    }
  }

  // 📊 جلب وبث قائمة المستخدمين النشطين لحظياً لجميع الأطراف المتصلة
  public async broadcastActiveUsers(): Promise<void> {
    if (!this.io) return;

    const query = `
      SELECT 
          p.user_id,
          p.is_online,
          p.last_seen,
          v.full_name,
          v.secure_photo_url,
          v.photo_url
      FROM user_presence p
      LEFT JOIN volunteer_profiles v ON p.user_id = v.user_id
      WHERE p.is_online = true 
         OR p.last_seen >= NOW() - INTERVAL '12 hours'
      ORDER BY p.is_online DESC, p.last_seen DESC;
    `;

    try {
      // تمرير النوع ActiveUserRow ليكون الناتج نموذجياً وصارماً
      const result = await pool.query<ActiveUserRow>(query);
      this.io.emit('active_users_update', result.rows);
    } catch (err) {
      console.error('❌ [SOCKET DB ERROR]: فشل جلب وبث الأعضاء النشطين:', err);
    }
  }
}

export const socketService = new SocketService();
