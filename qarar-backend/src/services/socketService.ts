import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import pool from '../config/db'; 

interface ServerToClientEvents {
  active_users_update: (users: ActiveUserRow[]) => void;
  new_notification: (data: { type: string; title: string; message: string; letter_id: string; priority: string }) => void;
}

interface ClientToServerEvents {}
interface InterServerEvents {}
interface SocketData {
  userId: string;
}

export interface ActiveUserRow {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  full_name: string;
  secure_photo_url: string | null;
  photo_url: string | null;
}

export class SocketService {
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

  // 📝 دالة مساعدة للتحقق هل المعرف عبارة عن UUID صحيح ومطابق لمعايير قاعدة البيانات أم معرف افتراضي
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  public initialize(server: http.Server): void {
    this.io = new Server(server, {
      cors: {
        origin: '*', 
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        console.log('🗝️ [SOCKET JWT DECODED]:', decoded);

        const userId = decoded.id || decoded.user_id || decoded.userId || decoded.sub;

        if (!userId) {
          console.warn('⚠️ [SOCKET]: لم يتم العثور على أي معرف مستخدم داخل التوكن.');
          return next(new Error('Authentication error: User ID missing in token'));
        }

        socket.data.userId = userId; 
        next();
      } catch (err) {
        console.error('❌ [SOCKET AUTH ERROR]: خطأ أثناء التحقق من التوكن:', err);
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', async (socket) => {
      const userId = socket.data.userId;
      const socketId = socket.id;

      if (userId) {
        console.log(`🟢 [SOCKET CONNECTED]: مستخدم متصل UUID: ${userId} | Socket ID: ${socketId}`);
        
        // 👍 الإبقاء على الغرفة لتوصيل الإشعارات الفورية لحسابك بشكل طبيعي جداً
        socket.join(userId); 
        
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

  // 🟢 تحديث حالة المستخدم في قاعدة البيانات إلى "متصل الآن" (محمية الآن)
  private async setUserOnline(userId: string, socketId: string): Promise<void> {
    // 🛡️ حارس أمان: لو المعرف ليس UUID (مثل حسابات الـ virtual admin)، تخطى استعلام قاعدة البيانات لمنع الكراش
    if (!this.isValidUUID(userId)) {
      console.info(`ℹ️ [SOCKET]: تم تخطي تحديث جدول المتواجدين للمعرف الإداري المخصص: ${userId}`);
      return;
    }

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

  // 📊 جلب وبث قائمة المستخدمين النشطين لحظياً
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
      const result = await pool.query<ActiveUserRow>(query);
      this.io.emit('active_users_update', result.rows);
    } catch (err) {
      console.error('❌ [SOCKET DB ERROR]: فشل جلب وبث الأعضاء النشطين:', err);
    }
  }

  public sendNotificationToUser(userId: string, data: { type: string; title: string; message: string; letter_id: string; priority: string }): void {
    if (this.io) {
      this.io.to(userId).emit('new_notification', data);
    }
  }
}

export const socketService = new SocketService();
