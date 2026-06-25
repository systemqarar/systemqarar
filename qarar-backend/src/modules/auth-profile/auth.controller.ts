import { Request, Response } from 'express';
import { hasrApiClient } from '../../services/hasrApiClient';
import db from '../../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { whatsappService } from '../../services/whatsappService'; 

export const authController = {
  // 1️⃣ الشاشة 1: تسجيل الدخول الروتيني الفعلي من قاعدة البيانات
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' });
        return;
      }

      const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      
      if (userResult.rows.length === 0) {
        res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        return;
      }

      const user = userResult.rows[0];

      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        res.status(423).json({ error: 'الحساب مغلق مؤقتاً بسبب محاولات خاطئة متكررة. حاول مجدداً لاحقاً.' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        const attempts = (user.failed_attempts || 0) + 1;
        if (attempts >= 5) {
          const lockTime = new Date(Date.now() + 15 * 60 * 1000);
          await db.query('UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3', [attempts, lockTime, user.id]);
        } else {
          await db.query('UPDATE users SET failed_attempts = $1 WHERE id = $2', [attempts, user.id]);
        }
        res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        return;
      }

      await db.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [user.id]);

      const jwtSecret = process.env.JWT_SECRET || 'qarar-secret-key-2026-strict';
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role, is_acting: user.is_acting },
        jwtSecret,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        token,
        user: { id: user.id, username: user.username, role: user.role, is_acting: user.is_acting }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'خطأ داخلي في الخادم أثناء تسجيل الدخول' });
    }
  },

  // 2️⃣ الشاشة 2: فحص المعرف وصياغة رسالة الـ OTP وإرسالها
  verifyVolunteer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { volunteer_id } = req.body;

      if (!volunteer_id) {
        res.status(400).json({ error: 'الرجاء إدخال رقم المتطوع الموحد' });
        return;
      }

      const volunteerData = await hasrApiClient.getVolunteerById(volunteer_id);

      if (volunteerData.status !== 'approved') {
        res.status(403).json({ error: 'عذراً، هذا الحساب معلق أو غير معتمد في نظام الحصر الرسمي' });
        return;
      }

      const currentUnitId = volunteerData.unitId || volunteerData.unit_id;
      if (Number(currentUnitId) !== 7) {
        res.status(403).json({ error: 'عذراً، النظام متاح حالياً فقط لمتطوعي وحدة الكلاكلة شرق الإدارية' });
        return;
      }

      const volunteerSnapshot = {
        volunteer_id: volunteerData.volunteerId,
        national_id: volunteerData.nationalId,
        full_name: volunteerData.fullName,
        phone: volunteerData.phone,
        whatsapp: volunteerData.whatsapp || volunteerData.phone,
        photo_url: volunteerData.photoUrl,
        is_tot_trainer: volunteerData.isTotTrainer,
        current_status_in_khartoum: volunteerData.currentStatusInKhartoum || 'داخل الولاية',
        unit_name: volunteerData.unitName
      };

      const targetWhatsapp = volunteerSnapshot.whatsapp || '';

      // 🟢 [التعديل الجوهري]: صياغة الرسالة داخل الكنترولر وتمريرها للسيرفس العام
      if (targetWhatsapp) {
        console.log(`🚀 جاري تجهيز رسالة الـ OTP وتمريرها للرقم: ${targetWhatsapp}`);
        
        const otpCode = '123456'; // الرمز الثابت المؤقت للمحاكاة
        const customMessage = `🔐 [نظام قرار الرقمي]\n\nرمز التحقق الخاص بك هو: ${otpCode}\n\nيرجى عدم مشاركة هذا الرمز مع أي شخص للحفاظ على أمان حسابك.`;
        
        // استدعاء دالة الإرسال العامة الجديدة
        await whatsappService.sendMessage(targetWhatsapp, customMessage);
      }

      const masked = targetWhatsapp.replace(/^(\+\d{5})(\d{4})(\d{3})$/, '$1****$3');

      res.status(200).json({
        message: 'المتطوع مدرج بالحصر ومطابق للشروط، تم إرسال الرمز للواتساب المعتمد',
        masked_whatsapp: masked,
        snapshot: volunteerSnapshot
      });
    } catch (error: any) {
      console.error('Verify Volunteer Error:', error);
      res.status(500).json({ error: error.message || 'خطأ أثناء فحص الحصر والربط الحي' });
    }
  },

  // 3️⃣ الشاشة 3: مطابقة رمز الـ OTP
  verifyOTP: async (req: Request, res: Response): Promise<void> => {
    try {
      const { volunteer_id, otp_code } = req.body;

      if (otp_code === '123456') {
        res.status(200).json({ message: 'تم التحقق من الرمز بنجاح وعزل البيانات' });
        return;
      }

      res.status(400).json({ error: 'رمز التحقق غير صحيح أو انتهت صلاحيته الحركية' });
    } catch (error) {
      res.status(500).json({ error: 'خطأ أثناء مطابقة الرمز' });
    }
  },

  // 3️⃣ مكرر: مسار الطوارئ الميداني والطلب اليدوي
  emergencyRequest: async (req: Request, res: Response): Promise<void> => {
    try {
      const { volunteer_id } = req.body;
      res.status(200).json({ 
        message: `🚨 تم رفع طلب طوارئ يدوي للمعرف ${volunteer_id}. يرجى مراجعة قيادة الوحدة لتفعيل الحساب يدوياً.` 
      });
    } catch (error) {
      res.status(500).json({ error: 'فشل تسجيل طلب الطوارئ' });
    }
  },

  // 4️⃣ الشاشة 4: إنشاء الحساب النهائي الفعلي وحفظ البيانات المعزولة في جداول Neon السحابية
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password, snapshot } = req.body;

      if (!username || !password || !snapshot) {
        res.status(400).json({ error: 'البيانات المدخلة غير مكتملة' });
        return;
      }

      const checkUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
      if (checkUser.rows.length > 0) {
        res.status(400).json({ error: 'اسم المستخدم هذا محجوز مسبقاً، اختر اسماً آخر' });
        return;
      }

      const checkVolunteer = await db.query('SELECT id FROM users WHERE volunteer_id = $1', [snapshot.volunteer_id]);
      if (checkVolunteer.rows.length > 0) {
        res.status(400).json({ error: 'رقم المتطوع الموحد هذا مبرمج ومسجل بحساب آخر بالفعل!' });
        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const assignedRole = snapshot.is_tot_trainer ? 'volunteer_trainer' : 'volunteer';

      const userInsertQuery = `
        INSERT INTO users (volunteer_id, national_id, username, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;
      const userValues = [snapshot.volunteer_id, snapshot.national_id, username, hashedPassword, assignedRole];
      const userInsertResult = await db.query(userInsertQuery, userValues);
      
      const newUserId = userInsertResult.rows[0].id;

      const profileInsertQuery = `
        INSERT INTO volunteer_profiles (
          user_id, full_name, phone, whatsapp, photo_url, is_tot_trainer, current_status_in_khartoum
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      const profileValues = [
        newUserId,
        snapshot.full_name,
        snapshot.phone,
        snapshot.whatsapp,
        snapshot.photo_url,
        snapshot.is_tot_trainer,
        snapshot.current_status_in_khartoum
      ];
      
      await db.query(profileInsertQuery, profileValues);

      res.status(201).json({
        message: 'تم إنشاء وتفعيل حسابك الموحد وحفظ لقطتك المعزولة في Neon بنجاح! توجه لشاشة الدخول الروتيني.',
        user: { username, role: assignedRole }
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ error: 'فشل تفعيل وحفظ الحساب النهائي في السيرفر السحابي' });
    }
  }
};

export default authController;
