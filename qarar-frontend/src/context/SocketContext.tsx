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

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

// 💡 متغيّر عالمي خارج المكون: يضمن إن التطبيق كلو ما يفتحش غير خط واحد مهما React أعادت بناء المكون
let globalSocket: Socket | null = null;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('qarar_token');
    
    if (!token) {
      console.warn('⚠️ [SOCKET]: لم يتم العثور على توكن (qarar_token)، تعذر الاتصال بالويب سوكت.');
      // إذا سجل المستخدم خروجه، اقطع الاتصال فوراً ونظف المتغير العالمي
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 💡 إذا لم يكن هناك اتصال منشأ مسبقاً، أنشئه الآن
    if (!globalSocket) {
      const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const socketUrl = BACKEND_URL.replace(/\/api$/, '');

      globalSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false // نتحكم في الاتصال برمجياً لمنع العشوائية
      });
    }

    // 💡 تأكيد الاتصال إذا كان مغلقاً
    if (!globalSocket.connected) {
      globalSocket.connect();
    }

    setSocket(globalSocket);
    setIsConnected(globalSocket.connected);

    // 🔘 تعريف وظائف الاستماع للأحداث بشكل منفصل لنتمكن من تنظيفها بدقة
    const onConnect = () => {
      setIsConnected(true);
      console.log('🟢 [SOCKET]: تم الاتصال بنجاح مع سيرفر الويب سوكت.');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('🔴 [SOCKET]: انقطع الاتصال بسيرفر الويب سوكت.');
    };

    const onUsersUpdate = (users: ActiveUser[]) => {
      setActiveUsers(users);
    };

    // ربط الأحداث
    globalSocket.on('connect', onConnect);
    globalSocket.on('disconnect', onDisconnect);
    globalSocket.on('active_users_update', onUsersUpdate);

    // إذا عاد المكون للظهور وكان السوكت متصلاً بالفعل، حدّث الحالة فوراً
    if (globalSocket.connected) {
      setIsConnected(true);
    }

    // 🧹 التنظيف السحري: عند الـ Unmount بنشيل الـ Listeners بس عشان ما تتكرر، وبنسيب الخط مفتوح ونظيف
    return () => {
      if (globalSocket) {
        globalSocket.off('connect', onConnect);
        globalSocket.off('disconnect', onDisconnect);
        globalSocket.off('active_users_update', onUsersUpdate);
      }
    };
  }, []); 

  return (
    <SocketContext.Provider value={{ socket, activeUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
