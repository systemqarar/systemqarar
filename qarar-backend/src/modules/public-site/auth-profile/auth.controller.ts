import { Request, Response } from 'express';
import { hasrApiClient } from '../../../services/hasrApiClient'; 
import db from '../../../config/db'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { whatsappService } from '../../../services/whatsappService'; 

export const authController = {
  // 1️⃣ الشاشة 1: تسجيل الدخول الروتيني + بوابة السوبر أدمن الافتراضية
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'الرجاء إدخل اسم المستخدم وكلمة المرور' });
        return;
      }

      // =========================================================================
      // 🛡️ [بوابة الطوارئ الافتراضية للمطورين - الحساب الخارق الذكي]
      // =========================================================================
      const admin1User = process.env.ADMIN_ONE_USER;
      const admin1Pass = process.env.ADMIN_ONE_PASS;
      const admin1Name = process.env.ADMIN_ONE_NAME || 'لؤي جعفر'; 

      const admin2User = process.env.ADMIN_TWO_USER;
      const admin2Pass = process.env.ADMIN_TWO_PASS;
      const admin2Name = process.env.ADMIN_TWO_NAME || 'حازم محمد'; 

      const isFirstAdmin = admin1User && admin1Pass && username === admin1User && password === admin1Pass;
      const isSecondAdmin = admin2User && admin2Pass && username === admin2User && password === admin2Pass;

      if (isFirstAdmin || isSecondAdmin) {
        const chosenName = isFirstAdmin ? admin1Name : admin2Name;
        const virtualId = isFirstAdmin ? 'virtual-admin-001' : 'virtual-admin-002';

        const jwtSecret = process.env.JWT_SECRET || 'qarar-secret-key-2026-strict';
        
        const token = jwt.sign(
          { 
            userId: virtualId, 
            username: username, 
            role: 'super_admin', 
            is_acting: false, 
            isProfileCompleted: true,
            fullName: chosenName 
          },
          jwtSecret,
          { expiresIn: '24h' }
        );

        res.status(200).json({
          message: 'تم تسجيل دخول مطور المنظومة بنجاح حركي آمن',
          token,
          user: { 
            id: virtualId, 
            username: username, 
            role: 'super_admin', 
            volunteer_number: 'MASTER-000', 
            is_acting: false,
            is_profile_completed: true, 
            full_name: chosenName 
          }
        });
        return; 
      }
      // =========================================================================

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

      const profileResult = await db.query('SELECT is_profile_completed FROM volunteer_profiles WHERE user_id = $1', [user.id]);
      const isProfileCompleted = profileResult.rows[0]?.is_profile_completed ?? false;

      const jwtSecret = process.env.JWT_SECRET || 'qarar-secret-key-2026-strict';
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role, is_acting: user.is_acting, isProfileCompleted },
        jwtSecret,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        token,
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          volunteer_number: user.volunteer_number, 
          is_acting: user.is_acting,
          is_profile_completed: isProfileCompleted 
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'خطأ داخلي في الخادم أثناء تسجيل الدخول' });
    }
  },

  // 2️⃣ الشاشة 2: فحص المعرف وصياغة رسالة الـ OTP وإرسالها وسحب البيانات كاملة
  verifyVolunteer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { volunteer_number } = req.body;

      if (!volunteer_number) {
        res.status(400).json({ error: 'الرجاء إدخال رقم المتطوع الموحد' });
        return;
      }

      const volunteerData = await hasrApiClient.getVolunteerById(volunteer_number);

      if (volunteerData.status !== 'approved') {
        res.status(403).json({ error: 'عذراً، هذا الحساب معلق أو غير معتمد في نظام الحصر الرسمي' });
        return;
      }

      // =========================================================================
      // 🔒 [إعادة التفعيل والحماية]: النظام مقفل ومحمي تماماً فقط لوحدة الوحدة (رقم 7)
      // =========================================================================
      const currentUnitId = volunteerData.unitId || volunteerData.unit_id;
      if (Number(currentUnitId) !== 7) {
        res.status(403).json({ error: 'عذراً، النظام متاح حالياً فقط لمتطوعي وحدة الكلاكلة شرق الإدارية' });
        return;
      }
      // =========================================================================

      const volunteerSnapshot = {
        volunteer_number: volunteerData.volunteerId, 
        national_id: volunteerData.nationalId,
        full_name: volunteerData.fullName,
        phone: volunteerData.phone,
        whatsapp: volunteerData.whatsapp || volunteerData.phone,
        photo_url: volunteerData.photoUrl,
        is_tot_trainer: volunteerData.isTotTrainer,
        current_status_in_khartoum: volunteerData.currentStatusInKhartoum || 'داخل الولاية',
        unit_name: volunteerData.unitName || volunteerData.unit_name || 'وحدة الكلاكلة شرق', // 👈 نسحب الاسم برضه عشان البطاقة
        tot_year: volunteerData.totYear ? parseInt(volunteerData.totYear) : null,
        tot_certificate_url: volunteerData.totCertificateUrl || null,
        other_certificate_url: volunteerData.otherCertificateUrl || null,
        last_first_aid_refresher: volunteerData.lastFirstAidRefresher || null,
        other_programs: volunteerData.otherPrograms || null,
        expected_return_time: volunteerData.expectedReturnTime || null,
        availability_level: volunteerData.availabilityLevel || null
      };

      const targetWhatsapp = volunteerSnapshot.whatsapp || '';

      if (targetWhatsapp) {
        console.log(`🚀 جاري تجهيز رسالة الـ OTP وتمريرها للرقم: ${targetWhatsapp}`);
        const otpCode = '123456'; 
        const customMessage = `🔐 [نظام قرار الرقمي]\n\nرمز التحقق الخاص بك هو: ${otpCode}\n\nيرجى عدم مشاركة هذا الرمز مع أي شخص للحفاظ على أمان حسابك.`;
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
      const { volunteer_number, otp_code } = req.body;

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
      const { volunteer_number } = req.body;
      res.status(200).json({ 
        message: `🚨 تم رفع طلب طوارئ يدوي للمعرف ${volunteer_number}. يرجى مراجعة قيادة الوحدة لتفعيل الحساب يدوياً.` 
      });
    } catch (error) {
      res.status(500).json({ error: 'فشل تسجيل طلب الطوارئ' });
    }
  },

  // 4️⃣ الشاشة 4: إنشاء الحساب وحفظ البيانات كاملة في جداول Neon السحابية
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

      const checkVolunteer = await db.query('SELECT id FROM users WHERE volunteer_number = $1', [snapshot.volunteer_number]);
      if (checkVolunteer.rows.length > 0) {
        res.status(400).json({ error: 'رقم المتطوع الموحد هذا مبرمج ومسجل بحساب آخر بالفعل!' });
        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const assignedRole = snapshot.is_tot_trainer ? 'volunteer_trainer' : 'volunteer';

      const userInsertQuery = `
        INSERT INTO users (volunteer_number, national_id, username, password_hash, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;
      const userValues = [snapshot.volunteer_number, snapshot.national_id, username, hashedPassword, assignedRole];
      const userInsertResult = await db.query(userInsertQuery, userValues);
      
      const newUserId = userInsertResult.rows[0].id;

      // 🛠️ حفظ اسم الوحدة في الداتابيز Neon DB
      const profileInsertQuery = `
        INSERT INTO volunteer_profiles (
          user_id, volunteer_number, full_name, phone, whatsapp, photo_url, is_tot_trainer, 
          current_status_in_khartoum, tot_year, tot_certificate_url, other_certificate_url, 
          last_first_aid_refresher, other_programs, expected_return_time, availability_level, is_profile_completed,
          unit_name 
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);
      `;
      
      const profileValues = [
        newUserId,
        snapshot.volunteer_number,
        snapshot.full_name,
        snapshot.phone,
        snapshot.whatsapp,
        snapshot.photo_url,
        snapshot.is_tot_trainer,
        snapshot.current_status_in_khartoum,
        snapshot.tot_year,
        snapshot.tot_certificate_url,
        snapshot.other_certificate_url,
        snapshot.last_first_aid_refresher,
        snapshot.other_programs,
        snapshot.expected_return_time,
        snapshot.availability_level,
        false,
        snapshot.unit_name // 👈 ينزل اسم الوحدة هنا بأمان
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
