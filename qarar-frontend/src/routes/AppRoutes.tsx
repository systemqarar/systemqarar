import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthRoutes from '../environments/public-site/modules/auth/auth.routes';

import DashboardLayout from '../environments/unified-dashboard/modules/overview/pages/DashboardLayout';
import { volunteerProfileRoutes } from '../environments/unified-dashboard/modules/volunteer-profile/volunteer-profile.routes';
import { OnboardingWizardPage } from '../environments/unified-dashboard/modules/volunteer-profile/onboarding-wizard/pages/OnboardingWizardPage';

// استيراد مكونات المطور المسبكة الجديدة بناءً على تعديلك الذكي
import DeveloperLayout from '../environments/develop-dashboard/components/DeveloperLayout';
import { developRoutes } from '../environments/develop-dashboard/develop.routes';

// حارس مسارات المتطوعين الحالي
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user, setUser } = useAuth(); 

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

  if (user?.is_profile_completed === false) {
    return (
      <OnboardingWizardPage 
        onWizardComplete={() => {
          if (setUser) {
            setUser({ ...user, is_profile_completed: true });
          } else {
            window.location.href = '/login';
          }
        }} 
      />
    );
  }

  return <>{children}</>;
};

// حارس مسارات المطور (السوبر أدمن) المعتمد والمحمي تماماً
const DeveloperGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex justify-center items-center text-white font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#C3073F]"></div>
      </div>
    );
  }

  // الفحص الصارم المطابق لنوع رتبتك في النظام 'super_admin'
  if (!isAuthenticated || user?.role !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* موديول الأمان والتحقق */}
        <Route path="/*" element={<AuthRoutes />} />

        {/* لوحة تحكم المتطوعين */}
        <Route 
          path="/dashboard" 
          element = {
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          {volunteerProfileRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* لوحة تحكم المطور المخصصة والمحمية */}
        <Route 
          path="/developer" 
          element = {
            <DeveloperGuard>
              <DeveloperLayout />
            </DeveloperGuard>
          } 
        >
          {/* هنا تنفرد وتصب كل مسارات موديولات المطور تلقائياً وبنفس أسلوب المتطوعين */}
          {developRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
