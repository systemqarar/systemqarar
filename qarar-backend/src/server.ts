import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; // 🌐 مطلوب لتشغيل Socket.io مع Express بشكل متزامن
import { socketService } from './services/socketService'; // 🔌 خدمة الويب سوكت المركزية الجديدة
import authRoutes from './modules/public-site/auth-profile/auth.routes'; // 🌐 موديول الحسابات والأمان القديم

// 🪪 🛡️ استيراد الراوتر الرئيسي للموديول (الـ Gateway الجديد اللي بيجمع كل الفروع)
import volunteerProfileRouter from './modules/unified-dashboard/volunteer-profile/volunteer-profile.routes';

// 🛠️ 💻 استيراد موديول المطور وغرفة التحكم الفريدة (Super Admin Gateway)
import developerZoneRouter from './modules/developer-zone/developer-zone.routes';

// 🤖 استيراد موديول غيث الجديد من الـ public-site
import ghaithRoutes from './modules/public-site/ghaith/ghaith.routes';

// ✉️ 📄 استيراد راوتر موديول الخطابات والوثائق الرسمية الجديد (التنظيم ألف)
import lettersReportsRouter from './modules/unified-dashboard/letters-reports/letters-reports.routes';

// 📋 🎯 استيراد راوتر موديول المهام والأنشطة واللجان الجديد
import tasksActivitiesRouter from './modules/unified-dashboard/tasks-activities/tasks-activities.routes';

import { whatsappService } from './services/whatsappService'; // 🟢 خدمة الواتساب المركزية

// تفعيل قراءة الملفات البيئية السرية (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// إنشاء سيرفر HTTP مركزي ليعمل كـ wrapper لـ Express و Socket.io
const server = http.createServer(app);

// 1. برمجيات الوسيطة الأساسية (Middleware)
app.use(cors({
  origin: '*', // في مرحلة الإنتاج حنحصرها فقط في رابط الـ Vercel الخاص بالواجهة للأمان الصارم
  credentials: true
}));
app.use(express.json()); // للسماح للسيرفر بقراءة كائنات الـ JSON القادمة من الواجهات

// 🟢 2. نقطة الاستجابة للرابط الرئيسي وفحص السلامة (Root & Health Check Endpoints)
// مسار الرابط الرئيسي (يمنع خمول السيرفر ويرد على cron-job بـ 200 OK)
app.get('/', (req, res) => {
  res.status(200).send('⚡ نظام قرار شغال وجاهز 100%');
});

// مسار فحص الصحة العام
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
app.use('/api/volunteer', volunteerProfileRouter);

// 🛡️ 5. تفعيل موديول المطور المحمي والمشفر على مستوى السيرفر
app.use('/api/developer-zone', developerZoneRouter);

// 🤖 6. تفعيل موديول المساعد الرقمي غيث واستقبال أسئلة الفحص والتجربة
app.use('/api/public-site/ghaith', ghaithRoutes);

// ✉️ 7. تفعيل موديول الخطابات والوثائق الإدارية لربطه بالـ Controller وغيث وسوكت
app.use('/api/letters-reports', lettersReportsRouter);

// 📋 8. تفعيل موديول المهام والأنشطة واللجان الإدارية
app.use('/api/tasks-activities', tasksActivitiesRouter);

// 🔌 9. تهيئة وتشغيل خدمة الـ Socket.io وإقرانها بسيرفر الـ HTTP
socketService.initialize(server);

// 10. تشغيل المحرك والاستماع للمنفذ المعين وتفعيل الواتساب حياً (تعديل الاستماع ليكون عبر server)
server.listen(PORT, async () => {
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
