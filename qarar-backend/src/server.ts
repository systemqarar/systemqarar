import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/public-site/auth-profile/auth.routes'; // 🌐 🌟 تم تحديث المسار هنا لمطابقة الهيكلية المنظمة الجديدة
import { whatsappService } from './services/whatsappService'; // 🟢 استيراد خدمة الواتساب المركزية الجديدة

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
// مهمة جداً ومنقذة للحياة؛ لأن منصة Render تستخدمها للتأكد من أن السيرفر يعمل قبل إتاحة الرابط للجمهور
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    system: 'Qarar Backend', 
    timestamp: new Date() 
  });
});

// 3. ربط وتفعيل موديول الحسابات والأمان (Auth Routes)
app.use('/api/auth', authRoutes);

// 4. تشغيل المحرك والاستماع للمنفذ المعين وتفعيل الواتساب حياً
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
