import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/public-site/auth-profile/auth.routes'; // 🌐 موديول الحسابات والأمان القديم

// 🪪 🛡️ استيراد الراوتر الرئيسي للموديول (الـ Gateway الجديد اللي بيجمع كل الفروع)
import volunteerProfileRouter from './modules/unified-dashboard/volunteer-profile/volunteer-profile.routes';

import { whatsappService } from './services/whatsappService'; // 🟢 خدمة الواتساب المركزية

// تفعيل قراءة الملفات البيئية السرية (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. برمجيات الوسيطة الأساسية (Middleware)
app.use(cors({
  origin: '*', // في مرحلة الإنتاج حنحصرها فقط في رابط الـ Vercel الخاص بالواجهة للأمان الصارم
  credentials: true
}));
app.use(express.json()); // للسماح للسيرفر بقراءة كائنات الـ JSON القادمة من الواجهات

// 2. نقطة فحص السلامة (Health Check Endpoint)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    system: 'Qarar Backend', 
    timestamp: new Date() 
  });
});

// 3. ربط وتفعيل موديول الحسابات والأمان (Auth Routes)
app.use('/api/auth', authRoutes);

// 🪪 4. تفعيل موديول البروفايل العام (منظومة قرار) عبر الراوتر المجمع
// 📝 الرابط النهائي للبيانات الشخصية حيبقى تلقائياً: /api/volunteer/profile/personal-data
// 📝 ولو حفظ بيانات حيبقى: /api/volunteer/profile/personal-data/update
app.use('/api/volunteer/profile', volunteerProfileRouter);

// 5. تشغيل المحرك والاستماع للمنفذ المعين وتفعيل الواتساب حياً
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`⚡ [SERVER RUNNING]: السيرفر ينبض بالحياة الآن على منفذ: ${PORT}`);
  console.log(`🔒 [ENVIRONMENT]: وضع المحاكاة الذكي = ${process.env.DEVELOPMENT_MODE}`);
  console.log(`===================================================`);
  
  // 🟢 إطلاق وتشغيل خدمة ربط وتفعيل الواتساب بمجرد استقرار السيرفر حياً
  try {
    console.log('⏳ [تهيئة]: جاري تشغيل خط اتصال الواتساب الحركي...');
    await whatsappService.initialize();
  } catch (whatsappError) {
    console.error('❌ [خطأ حرج]: فشل تشغيل محرك الواتساب أثناء إقلاع السيرفر:', whatsappError);
  }
});
