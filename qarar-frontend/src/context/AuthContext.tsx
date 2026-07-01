import React, { createContext, useContext, useState, useEffect } from 'react';
import { IAuthUser } from '../types/auth.types';

interface IAuthContext {
  user: IAuthUser | null;
  setUser: (user: any) => void; // تم فك القيود لتفادي تعارض الـ camelCase والـ snake_case
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

  // دالة ذكية ومطورة لدمج الحقول ومنع تعارض تسميات (volunteer_number و volunteerNumber)
  const handleSetUser = (newUser: any) => {
    if (!newUser) {
      setUser(null);
      localStorage.removeItem('qarar_user');
      return;
    }

    // تأمين دمج الحقول ليرضى عنها الفرونتد والباكيند معاً دون انفجار
    const standardizedUser = {
      ...newUser,
      volunteer_number: newUser.volunteer_number || newUser.volunteerNumber,
      volunteerNumber: newUser.volunteerNumber || newUser.volunteer_number,
      is_profile_completed: newUser.is_profile_completed !== undefined ? newUser.is_profile_completed : newUser.isProfileCompleted,
      isProfileCompleted: newUser.isProfileCompleted !== undefined ? newUser.isProfileCompleted : newUser.is_profile_completed
    };

    setUser(standardizedUser);
    localStorage.setItem('qarar_user', JSON.stringify(standardizedUser));
  };

  // دالة تسجيل الدخول الناجح وحفظ البيانات أمنياً
  const loginUser = (newToken: string, newUser: IAuthUser) => {
    setToken(newToken);
    handleSetUser(newUser); // استخدام الدالة الذكية هنا للتأمين
    localStorage.setItem('qarar_token', newToken);
  };

  // دالة تسجيل الخروج وتطهير المتصفح
  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('qarar_token');
    localStorage.removeItem('qarar_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, token, isAuthenticated: !!token, isLoading, loginUser, logoutUser }}>
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