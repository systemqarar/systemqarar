import db from '../../config/db';
import { IUser, IVolunteerProfile } from './auth.types';
import { PoolClient } from 'pg';

export const AuthModel = {
  // البحث عن حساب بواسطة اسم المستخدم (تسجيل الدخول الروتيني)
  findByUsername: async (username: string): Promise<IUser | null> => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  },

  // فحص هل رقم المتطوع مسجل مسبقاً لمنع التكرار
  findByVolunteerId: async (volunteerId: string): Promise<IUser | null> => {
    const result = await db.query('SELECT * FROM users WHERE volunteer_id = $1', [volunteerId]);
    return result.rows[0] || null;
  },

  // إدارة عداد التخمين وقفل الحساب مؤقتاً
  updateLoginAttempts: async (userId: string, attempts: number, lockUntil: Date | null): Promise<void> => {
    await db.query(
      'UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3',
      [attempts, lockUntil, userId]
    );
  },

  // تصفير عداد المحاولات عند تسجيل الدخول الناجح
  resetLoginAttempts: async (userId: string): Promise<void> => {
    await db.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [userId]);
  },

  // حفظ رمز الـ OTP المشفر
  saveOTP: async (volunteerId: string, codeHash: string, expiresAt: Date): Promise<void> => {
    // حذف أي رموز قديمة لنفس المتطوع لتنظيف الجدول أولاً بأول
    await db.query('DELETE FROM otp_codes WHERE volunteer_id = $1', [volunteerId]);
    await db.query(
      'INSERT INTO otp_codes (volunteer_id, code_hash, expires_at) VALUES ($1, $2, $3)',
      [volunteerId, codeHash, expiresAt]
    );
  },

  // جلب آخر رمز OTP صالح للمطابقة
  getLatestOTP: async (volunteerId: string): Promise<{ code_hash: string; expires_at: Date } | null> => {
    const result = await db.query(
      'SELECT code_hash, expires_at FROM otp_codes WHERE volunteer_id = $1 ORDER BY expires_at DESC LIMIT 1',
      [volunteerId]
    );
    return result.rows[0] || null;
  },

  // تسجيل طلب طوارئ يدوي في حال عدم الوصول للواتساب
  createEmergencyRequest: async (volunteerId: string): Promise<void> => {
    await db.query(
      'INSERT INTO verification_requests (volunteer_id, status) VALUES ($1, \'pending\') ON CONFLICT (volunteer_id) DO NOTHING',
      [volunteerId]
    );
  },

  // إنشاء الحساب الأساسي (يستخدم الـ Client لضمان الـ Transaction)
  createUser: async (client: PoolClient, volunteerId: string, nationalId: string, username: string, passwordHash: string, role: string): Promise<IUser> => {
    const query = `
      INSERT INTO users (volunteer_id, national_id, username, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await client.query(query, [volunteerId, nationalId, username, passwordHash, role]);
    return result.rows[0];
  },

  // إنشاء الملف الشخصي المرتبط بالحساب الفوق
  createProfile: async (client: PoolClient, profile: IVolunteerProfile): Promise<void> => {
    const query = `
      INSERT INTO volunteer_profiles (
        user_id, full_name, phone, whatsapp, photo_url, is_tot_trainer, current_status_in_khartoum
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    await client.query(query, [
      profile.user_id,
      profile.full_name,
      profile.phone,
      profile.whatsapp,
      profile.photo_url,
      profile.is_tot_trainer,
      profile.current_status_in_khartoum
    ]);
  }
};
