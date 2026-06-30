import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthRoutes from '../environments/public-site/modules/auth/auth.routes';

// 👑 استيراد الواجهة الملكية الجديدة للوحة التحكم الموحدة
import DashboardLayout from '../environments/unified-dashboard/modules/overview/pages/DashboardLayout';

// 📦 استيراد خط المسارات المستقل الخاص بموديول البروفايل
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
  const { user, isAuthenticated } = useAuth(); // 🔑 جلب بيانات المستخدم الحالي لفحص حالة قفل البوابة

  return (
    <BrowserRouter>
      <Routes>
        {/* 📦 موديول الأمان والتحقق */}
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
          {/* 🛡️ الحارس الذكي لقرار: لو ملف المتطوع غير مكتمل، اقفله في صفحة البيانات الشخصية غصب عنه */}
          {isAuthenticated && user?.is_profile_completed === false ? (
            <>
              {/* تمرير وعرض مسار البيانات الشخصية/الويزارد فقط وحجب باقي الصفحات إدارياً */}
              {volunteerProfileRoutes
                .filter(route => route.path && (route.path.includes('personal-data') || route.path.includes('onboarding')))
                .map((route, index) => (
                  <Route key={index} path={route.path || ''} element={route.element} />
                ))}
              
              {/* ⛔ حماية مطلقة وتوجيه صحيح: هسي حيرجعه لصفحة الاستكمال بالمسار الكامل والمظبوط لمنع الدوامة */}
              <Route path="*" element={<Navigate to="profile/personal-data" replace />} />
            </>
          ) : (
            <>
              {/* 🔓 الوضع الطبيعي: المتطوع مكمل بيانات قرار، افتح ليهو كل مسارات السيستم المعتمدة بالكامل */}
              {volunteerProfileRoutes.map((route, index) => (
                <Route key={index} path={route.path || ''} element={route.element} />
              ))}
            </>
          )}
        </Route>

        {/* التوجيه التلقائي لأي رابط عشوائي مباشرة لصفحة الدخول */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
