import React, { createContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ActiveUser {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  full_name: string;
  secure_photo_url: string | null;
  photo_url: string | null;
}

interface SocketContextType {
  socket: Socket | null;
  activeUsers: ActiveUser[];
  isConnected: boolean;
}

// تصدير الـ Context بشكل مستقل ليتم استدعاؤه في الهوك الخارجي useSocket
export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 🔑 جلب التوكن الحقيقي والمطابق لنظام أمان "قرار" عندك
    const token = localStorage.getItem('qarar_token');
    
    if (!token) {
      console.warn('⚠️ [SOCKET]: لم يتم العثور على توكن (qarar_token)، تعذر الاتصال بالويب سوكت.');
      return;
    }

    // رابط الباكيند (سيقرأ من ملف البيئة في فيرسل، أو يعمل محلياً)
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // 🛠️ التعديل السحري: إزالة /api من نهاية الرابط إن وُجد لضمان الاتصال بـ Namespace الافتراضي (/)
    const socketUrl = BACKEND_URL.replace(/\/api$/, '');

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket']
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('🟢 [SOCKET]: تم الاتصال بنجاح مع سيرفر الويب سوكت.');
    });

    // الاستماع لقائمة المتصلين والنشطين المحدثة فوراً من السيرفر
    socketInstance.on('active_users_update', (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔴 [SOCKET]: انقطع الاتصال بسيرفر الويب سوكت.');
    });

    setSocket(socketInstance);

    // قطع الاتصال تلقائياً عند تسجيل الخروج أو إغلاق التطبيق
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, activeUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
