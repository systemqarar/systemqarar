import db from '../../config/db';
import { IUser, IVolunteerProfile } from './auth.types';
import { PoolClient } from 'pg';

export const AuthModel = {
  // البحث عن حساب بواسطة اسم المستخدم (تسجيل الدخول الروتيني)
  findByUsername: async (username: string): Promise<IUser | null> => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  },

  // ✅ التعديل هنا: فحص هل رقم المتطوع مسجل مسبقاً لمنع التكرار (استخدام volunteer_number)
  findByVolunteerNumber: async (volunteerNumber: string): Promise<IUser | null> => {
    const result = await db.query('SELECT * FROM users WHERE volunteer_number = $1', [volunteerNumber]);
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

  // ✅ التعديل هنا: حفظ رمز الـ OTP باستخدام volunteer_number
  saveOTP: async (volunteerNumber: string, codeHash: string, expiresAt: Date): Promise<void> => {
    await db.query('DELETE FROM otp_codes WHERE volunteer_number = $1', [volunteerNumber]);
    await db.query(
      'INSERT INTO otp_codes (volunteer_number, code_hash, expires_at) VALUES ($1, $2, $3)',
      [volunteerNumber, codeHash, expiresAt]
    );
  },

  // ✅ التعديل هنا: جلب آخر رمز OTP صالح للمطابقة
  getLatestOTP: async (volunteerNumber: string): Promise<{ code_hash: string; expires_at: Date } | null> => {
    const result = await db.query(
      'SELECT code_hash, expires_at FROM otp_codes WHERE volunteer_number = $1 ORDER BY expires_at DESC LIMIT 1',
      [volunteerNumber]
    );
    return result.rows[0] || null;
  },

  // ✅ التعديل هنا: تسجيل طلب طوارئ يدوي باستخدام volunteer_number
  createEmergencyRequest: async (volunteerNumber: string): Promise<void> => {
    await db.query(
      'INSERT INTO verification_requests (volunteer_number, status) VALUES ($1, \'pending\') ON CONFLICT (volunteer_number) DO NOTHING',
      [volunteerNumber]
    );
  },

  // ✅ التعديل هنا: إنشاء الحساب الأساسي (استخدام volunteer_number)
  createUser: async (client: PoolClient, volunteerNumber: string, nationalId: string, username: string, passwordHash: string, role: string): Promise<IUser> => {
    const query = `
      INSERT INTO users (volunteer_number, national_id, username, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await client.query(query, [volunteerNumber, nationalId, username, passwordHash, role]);
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
