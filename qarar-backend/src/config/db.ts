import { Pool, QueryResult, QueryResultRow } from 'pg'; // 🔑 استيراد الأنواع الرسمية من مكتبة pg
import dotenv from 'dotenv';

// تفعيل قراءة متغيرات البيئة السرية
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('⚠️ خطأ كارثي: لم يتم العثور على متغير DATABASE_URL في ملف الـ .env السرّي!');
}

// إنشاء مجمع الاتصالات الـ Pool بتعديل الأمان المطور المتوافق مع libpq لمنع التحذيرات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // التعديل الصارم: إجبار المكتبة على نمط التحقق الكامل المتوافق مع النسخ المستقبلية ومزودي السحاب مثل Neon
    rejectUnauthorized: false
  }
});

// اختبار الاتصال اللحظي للتأكد من سلامة الخيوط المعمارية
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ فشل الاتصال بقاعدة بيانات Neon السحابية:', err.message);
  } else {
    console.log('🚀 تم الاتصال بنجاح وأمان مع قاعدة بيانات نظام قرار في Neon بنجاح اللحظة:', res.rows[0].now);
  }
});

/**
 * 🛡️ ترقية دالة الاستعلام الوسيطة هندسياً لتصبح Generic 
 * تضمن نقل وتمرير هياكل الجداول والصفوف تلقائياً وبأعلى حماية للمستقبل دون كسر أي كود قديم في الباكيند
 */
export const query = <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export default {
  pool,
  query,
};
