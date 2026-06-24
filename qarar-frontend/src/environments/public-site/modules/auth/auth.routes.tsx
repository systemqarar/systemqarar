import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

export const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      {/* روت صفحة تسجيل الدخول مستقل وتابع للموديول بالكامل */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AuthRoutes;
