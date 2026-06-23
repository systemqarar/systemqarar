import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthModel } from './auth.models';
import { hasrApiClient } from '../../services/hasrApiClient';
import db from '../../config/db';

export const AuthController = {
  // 1. فحص المعرف في نظام الحصر وإطلاق الـ OTP (الشاشة 2)
  verifyVolunteer = async (req: Request, res: Response): Promise<any> => {
    try {
      const { volunteer_id } = req.body;
      if (!volunteer_id) return res.status(400).json({ error: 'رقم المتطوع مطلوب' });

      const existingUser = await AuthModel.findByVolunteerId(volunteer_id);
      if (existingUser) {
        return res.status(400).json({ error: 'هذا المتطوع مسجل بالفعل بالنظام، يرجى تسجيل الدخول الروتيني' });
      }

      const snapshot = await hasrApiClient.getVolunteerSnapshot(volunteer_id);
      if (!snapshot) {
        return res.status(404).json({ error: 'رقم المتطوع غير مدرج بنظام الحصر الخارجي' });
      }

      // توليد الرمز: 123456 في وضع التطوير، وعشوائي في الإنتاج
      const rawOtp = process.env.DEVELOPMENT_MODE === 'true' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = await bcrypt.hash(rawOtp, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // صلاحية 5 دقائق

      await AuthModel.saveOTP(volunteer_id, codeHash, expiresAt);

      console.log(`[🔒 OTP SENT] Volunteer: ${volunteer_id} | Code: ${rawOtp}`);

      return res.status(200).json({
        message: 'تم إرسال رمز التحقق بنجاح لواتساب المتطوع المعتمد',
        masked_whatsapp: snapshot.whatsapp.replace(/(?<=\d{3})\d(?=\d{3})/g, "*"),
        snapshot
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // 2. مطابقة الرمز المدخل (الشاشة 3)
  verifyOTP = async (req: Request, res: Response): Promise<any> => {
    try {
      const { volunteer_id, otp_code } = req.body;
      if (!volunteer_id || !otp_code) return res.status(400).json({ error: 'البيانات المدخلة غير مكتملة' });

      const otpRecord = await AuthModel.getLatestOTP(volunteer_id);
      if (!otpRecord) return res.status(400).json({ error: 'لم يتم إرسال رمز تحقق لهذا المعرف' });

      if (new Date() > new Date(otpRecord.expires_at)) {
        return res.status(400).json({ error: 'رمز التحقق انتهت صلاحيته (5 دقائق)' });
      }

      const isValid = await bcrypt.compare(otp_code, otpRecord.code_hash);
      if (!isValid) return res.status(400).json({ error: 'رمز التحقق المدخل غير صحيح' });

      return res.status(200).json({ message: 'تم التحقق بنجاح، يمكنك إكمال استمارة الحساب الآن' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // 3. مسار الطوارئ والتحقق اليدوي (الشاشة 3)
  emergencyRequest = async (req: Request, res: Response): Promise<any> => {
    try {
      const { volunteer_id } = req.body;
      if (!volunteer_id) return res.status(400).json({ error: 'رقم المتطوع مطلوب' });

      await AuthModel.createEmergencyRequest(volunteer_id);
      return res.status(200).json({ message: 'تم رفع طلب الطوارئ اليدوي بنجاح، يرجى مراجعة إدارة الوحدة لاعتماد حسابك' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // 4. إنشاء الحساب النهائي وحفظ اللقطة الشخصية (الشاشة 4)
  register = async (req: Request, res: Response): Promise<any> => {
    const client = await db.pool.connect(); 
    try {
      const { username, password, snapshot } = req.body;
      if (!username || !password || !snapshot) return res.status(400).json({ error: 'جميع الحقول النشطة مطلوبة' });

      const userCheck = await AuthModel.findByUsername(username);
      if (userCheck) return res.status(400).json({ error: 'اسم المستخدم هذا مأخوذ بالفعل، اختر اسماً آخر' });

      await client.query('BEGIN');

      const passwordHash = await bcrypt.hash(password, 12);
      const initialRole = snapshot.is_tot_trainer ? 'volunteer_trainer' : 'volunteer';

      const newUser = await AuthModel.createUser(
        client,
        snapshot.volunteer_id,
        snapshot.national_id,
        username,
        passwordHash,
        initialRole
      );

      await AuthModel.createProfile(client, {
        user_id: newUser.id,
        full_name: snapshot.full_name,
        phone: snapshot.phone,
        whatsapp: snapshot.whatsapp,
        photo_url: snapshot.photo_url,
        is_tot_trainer: snapshot.is_tot_trainer,
        current_status_in_khartoum: snapshot.current_status_in_khartoum
      });

      await client.query('COMMIT');
      return res.status(201).json({ message: 'تم إنشاء وتفعيل حسابك بنجاح! ووجهنا للسيستم للشاشة الرئيسية للوجن الروتينى' });
    } catch (error: any) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  },

  // 5. تسجيل الدخول الروتيني وحماية الـ Brute-Force (الشاشة 1)
  login = async (req: Request, res: Response): Promise<any> => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });

      const user = await AuthModel.findByUsername(username);
      if (!user) return res.status(401).json({ error: 'بيانات الاعتماد المدخلة غير صحيحة' });

      // التحقق من حالة القفل الزمني ضد التخمين العنيف
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        const remainingMinutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
        return res.status(423).json({ error: `هذا الحساب مغلق مؤقتاً لحمايته ضد التخمين. يرجى المحاولة بعد ${remainingMinutes} دقيقة.` });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        const newAttempts = user.failed_attempts + 1;
        let lockUntil = null;

        if (newAttempts >= 5) {
          lockUntil = new Date(Date.now() + 15 * 60 * 1000); // قفل الحساب صراحة 15 دقيقة
        }

        await AuthModel.updateLoginAttempts(user.id, newAttempts, lockUntil);
        
        const remaining = 5 - newAttempts;
        return res.status(401).json({ 
          error: 'بيانات الاعتماد المدخلة غير صحيحة',
          attempts_left: remaining > 0 ? `متبقي لك ${remaining} محاولات قبل قفل الحساب.` : 'تم قفل الحساب مؤقتاً لمدة 15 دقيقة.'
        });
      }

      await AuthModel.resetLoginAttempts(user.id);

      // إصدار توكن مدمج به الهوية والدور وعلم الاستخلاف للنوائب
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role, is_acting: user.is_acting },
        process.env.JWT_SECRET as string,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        token,
        user: { id: user.id, username: user.username, role: user.role, is_acting: user.is_acting }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
};
