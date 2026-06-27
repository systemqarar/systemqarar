import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthRoutes from '../environments/public-site/modules/auth/auth.routes';
// 👑 استيراد الواجهة الملكية الجديدة للوحة التحكم الموحدة
import DashboardLayout from '../environments/unified-dashboard/modules/overview/pages/DashboardLayout';

// 📦 استيراد خط المسارات المستقل الخاص بموديول البروفايل (العملناه قبل شوية)
import { volunteerProfileRoutes } from '../environments/unified-dashboard/modules/volunteer-profile/volunteer-profile.routes';

// حارس المسارات المحمية: يمنع دخول غير المسجلين للمنظومة
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex justify-center items-center text-white font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#C3073F]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 📦 موديول الأمان والتحقق: يستقبل ويشغل صفحات الدخول الآمن تلقائياً */}
        <Route path="/*" element={<AuthRoutes />} />

        {/* 📱 المسارات المحمية: لوحة التحكم الموحدة المخصصة للجوال (منظومة قرار) */}
        <Route 
          path="/dashboard" 
          element = {
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          {/* 🌲 هنا بتصب مسارات موديول البروفايل تلقائياً كأبناء داخل لوحة التحكم بدون ما نلخبط باقي الصفحات */}
          {volunteerProfileRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* التوجيه التلقائي لأي رابط عشوائي أو غير معروف مباشرة لصفحة الدخول */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
