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

// 💡 متغيّر عالمي خارج المكون
let globalSocket: Socket | null = null;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 📸 كاميرا مراقبة 1: لمعرفة هل المكون يعاد بناؤه بالكامل أم لا
    console.log('🎬 [SOCKET PROVIDER]: >>> تم تشغيل الـ useEffect (Mount) <<<');

    const token = localStorage.getItem('qarar_token');
    
    if (!token) {
      console.warn('⚠️ [SOCKET]: لم يتم العثور على توكن (qarar_token).');
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    if (!globalSocket) {
      console.log('🚀 [SOCKET]: يتم الآن إنشاء خط اتصال جديد لأول مرة...');
      const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const socketUrl = BACKEND_URL.replace(/\/api$/, '');

      globalSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false
      });
    } else {
      console.log('♻️ [SOCKET]: تم العثور على خط اتصال قديم في الذاكرة، سيتم إعادة استخدامه.');
    }

    if (!globalSocket.connected) {
      globalSocket.connect();
    }

    setSocket(globalSocket);
    setIsConnected(globalSocket.connected);

    const onConnect = () => {
      setIsConnected(true);
      console.log(`🟢 [SOCKET]: تم الاتصال بنجاح. الـ ID الحالي هو: ${globalSocket?.id}`);
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      // 📸 كاميرا مراقبة 2: لمعرفة سبب الفصل بالظبط (هل المتصفح اللي قفل أم السيرفر؟)
      console.log(`🔴 [SOCKET]: انقطع الاتصال! السبب القادم من السيرفر هو: ${reason}`);
    };

    const onUsersUpdate = (users: ActiveUser[]) => {
      setActiveUsers(users);
    };

    globalSocket.on('connect', onConnect);
    globalSocket.on('disconnect', onDisconnect);
    globalSocket.on('active_users_update', onUsersUpdate);

    if (globalSocket.connected) {
      setIsConnected(true);
    }

    return () => {
      console.log('🧹 [SOCKET PROVIDER]: <<< تنظيف الـ Listeners (Unmount) >>>');
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
