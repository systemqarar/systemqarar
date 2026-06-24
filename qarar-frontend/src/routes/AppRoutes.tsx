import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthRoutes from '../environments/public-site/modules/auth/auth.routes';

// حارس المسارات المحمية: يمنع دخول غير المسجلين
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex justify-center items-center text-white font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-red"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { user, logoutUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* 📦 موديول الأمان اللامركزي: يستقبل ويشغل كل مسارات الأمان تلقائياً */}
        <Route path="/*" element={<AuthRoutes />} />

        {/* المسارات المحمية: لوحة التحكم الموحدة (Dashboard) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-100 p-8 font-sans text-right" dir="rtl">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800">مرحباً بك في لوحة تحكم قرار 🚀</h1>
                  <p className="text-gray-600 mt-2">أنت مسجل دخول الآن بصفتك: <span className="text-brand-red font-bold">{user?.role}</span></p>
                  <button 
                    onClick={logoutUser} 
                    className="mt-6 bg-brand-dark hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    تسجيل الخروج من النظام
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* التوجيه التلقائي لأي رابط عشوائي */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
