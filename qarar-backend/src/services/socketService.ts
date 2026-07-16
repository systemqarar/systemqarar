import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import pool from '../config/db'; // جلب اتصال قاعدة البيانات المركزي عندك

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class SocketService {
  private io: Server | null = null;

  public initialize(server: http.Server): void {
    // تهيئة سيرفر الـ Socket.io مع إعدادات الـ CORS الآمنة
    this.io = new Server(server, {
      cors: {
        origin: '*', // يفضل حصرها برابط Vercel لاحقاً في الإنتاج
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // 🛡️ Middleware للتحقق من هوية المستخدم باستخدام الـ JWT قبل السماح بالاتصال
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
        socket.userId = decoded.id; // ربط الـ User UUID بالـ Socket الحالي
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    // الاستماع عند إنشاء اتصال جديد ناجح
    this.io.on('connection', async (socket: AuthenticatedSocket) => {
      const userId = socket.userId;
      const socketId = socket.id;

      if (userId) {
        console.log(`🟢 [SOCKET CONNECTED]: مستخدم متصل UUID: ${userId} | Socket ID: ${socketId}`);
        await this.setUserOnline(userId, socketId);
        
        // إبلاغ جميع المتصلين بوجود تحديث في قائمة النشطين تلقائياً
        this.broadcastActiveUsers();
      }

      // الاستماع عند قطع الاتصال (إغلاق الصفحة، انقطاع شبكة، إلخ)
      socket.on('disconnect', async () => {
        console.log(`🔴 [SOCKET DISCONNECTED]: انقطع اتصال Socket ID: ${socketId}`);
        await this.setUserOffline(socketId);
        
        // إبلاغ الجميع بالتحديث الجديد بعد خروج المستخدم
        this.broadcastActiveUsers();
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
      console.error('❌ [قاعدة البيانات]: فشل تحديث حالة المتصل أونلاين:', err);
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
      console.error('❌ [قاعدة البيانات]: فشل تحديث حالة المتصل أوفلاين:', err);
    }
  }

  // 📊 جلب وبث قائمة المستخدمين النشطين الآن والنشطين خلال الـ 12 ساعة الماضية
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
      const result = await pool.query(query);
      
      // بث القائمة اللحظية لجميع المستخدمين المتصلين بالسوكت حالياً
      this.io.emit('active_users_update', result.rows);
    } catch (err) {
      console.error('❌ [قاعدة البيانات]: فشل جلب وبث الأعضاء النشطين:', err);
    }
  }
}

export const socketService = new SocketService();
