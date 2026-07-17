import React, { createContext, useEffect, useState, useRef } from 'react';
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

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // 💡 إضافة useRef لتعقب حالة الاتصال ومنع التكرار
  const isConnectingRef = useRef(false);

  useEffect(() => {
    // 💡 إذا كان الاتصال قيد التنفيذ أو مفتوحاً بالفعل، لا تفعل شيئاً
    if (isConnectingRef.current) return;

    const token = localStorage.getItem('qarar_token');
    
    if (!token) {
      console.warn('⚠️ [SOCKET]: لم يتم العثور على توكن (qarar_token)، تعذر الاتصال بالويب سوكت.');
      return;
    }

    // 💡 رفع راية "الاتصال قيد التنفيذ" لمنع React من فتح اتصال جديد
    isConnectingRef.current = true;

    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socketUrl = BACKEND_URL.replace(/\/api$/, '');

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket']
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('🟢 [SOCKET]: تم الاتصال بنجاح مع سيرفر الويب سوكت.');
    });

    socketInstance.on('active_users_update', (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔴 [SOCKET]: انقطع الاتصال بسيرفر الويب سوكت.');
      // 💡 إعادة المؤشر للوضع الطبيعي عند انقطاع الاتصال
      isConnectingRef.current = false;
    });

    setSocket(socketInstance);

    return () => {
      // 💡 تنظيف الاتصال عند خروج المستخدم من التطبيق
      socketInstance.disconnect();
      isConnectingRef.current = false;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, activeUsers, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
