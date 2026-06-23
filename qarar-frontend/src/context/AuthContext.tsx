import React, { createContext, useContext, useState, useEffect } from 'react';
import { IAuthUser } from '../types/auth.types';

interface IAuthContext {
  user: IAuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (token: string, user: IAuthUser) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // فحص المتصفح لحظة الإقلاع للتأكد من وجود جلسة سابقة حية
  useEffect(() => {
    const storedToken = localStorage.getItem('qarar_token');
    const storedUser = localStorage.getItem('qarar_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // دالة تسجيل الدخول الناجح وحفظ البيانات أمنياً
  const loginUser = (newToken: string, newUser: IAuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('qarar_token', newToken);
    localStorage.setItem('qarar_user', JSON.stringify(newUser));
  };

  // دالة تسجيل الخروج وتطهير المتصفح
  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('qarar_token');
    localStorage.removeItem('qarar_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook مخصص وسهل لاستدعاء بيانات الأمان في أي صفحة بالفرونتد
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('⚠️ خطأ: useAuth يجب أن تُستخدم داخل الـ AuthProvider المخصص لها!');
  }
  return context;
};
