import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext' // 🔌 مسار مطابق تماماً لاسم ملفك الفعلي
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    /* 1. طبقة الأمان والتوكن في الأعلى */
    <AuthProvider>
      
      /* 2. طبقة السوكت تحتها مباشرة لتقرأ التوكن فوراً */
      <SocketProvider>
        
        /* 3. مسارات وصفحات نظام قرار بالكامل */
        <AppRoutes />
        
      </SocketProvider>
      
    </AuthProvider>
)
