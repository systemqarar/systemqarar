import { Request, Response } from 'express';
import { hasrApiClient } from '../../services/hasrApiClient';

// محاكاة سريعة لقاعدة بيانات الحصر المؤقتة
const mockVolunteerDb = [
  {
    volunteer_id: 'VOL-2026',
    national_id: '1234567890',
    full_name: 'أحمد عبد الله محمد',
    phone: '+249912345678',
    whatsapp: '+249111199119',
    photo_url: null,
    is_tot_trainer: true,
    current_status_in_khartoum: 'مستقر - أمدرمان'
  }
];

export const authController = {
  // 1️⃣ الشاشة 1: تسجيل الدخول الروتيني
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      
      if (username === 'admin' && password === 'admin123') {
        res.status(200).json({
          message: 'تم تسجيل الدخول بنجاح',
          token: 'mock-jwt-token-for-qarar-system-2026',
          user: { id: 'usr-1', username: 'admin', role: 'super_admin', is_acting: false }
        });
        return;
      }
      
      res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    } catch (error) {
      res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
  },

  // 2️⃣ الشاشة 2: فحص المعرف في لقطة نظام الحصر واعتماد ID الوحدة
  verifyVolunteer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { volunteer_id } = req.body;

      if (!volunteer_id) {
        res.status(400).json({ error: 'الرجاء إدخال رقم المتطوع الموحد' });
        return;
      }

      // 1. استجلاب البيانات حياً من نظام الحصر الخارجي
      const volunteerData = await hasrApiClient.getVolunteerById(volunteer_id);

      // 2. الفحص الصارم الأول: هل الحالة معتمد (approved)؟
      if (volunteerData.status !== 'approved') {
        res.status(403).json({ error: 'عذراً، هذا الحساب معلق أو غير معتمد في نظام الحصر الرسمي' });
        return;
      }

      // 3. الفحص الهندسي الصارم الثاني: التحقق من أن المتطوع تابع لوحدة الكلاكلة شرق عبر الرقم 7
      const currentUnitId = volunteerData.unitId || volunteerData.unit_id;
      if (Number(currentUnitId) !== 7) {
        res.status(403).json({ error: 'عذراً، النظام متاح حالياً فقط لمتطوعي وحدة الكلاكلة شرق الإدارية' });
        return;
      }

      // 4. ترجمة البيانات وتجهيز اللقطة (Snapshot) لتطابق مسميات الفرونتد المتوقعة
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

      // 5. إخفاء جزئي لرقم الواتساب المسترجع لحماية الخصوصية ميدانياً
      const targetWhatsapp = volunteerSnapshot.whatsapp || '';
      const masked = targetWhatsapp.replace(/^(\+\d{5})(\d{4})(\d{3})$/, '$1****$3');

      res.status(200).json({
        message: 'المتطوع مدرج بالحصر ومطابق للشروط، تم إرسال الرمز للواتساب المعتمد',
        masked_whatsapp: masked,
        snapshot: volunteerSnapshot
      });
    } catch (error: any) {
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

  // 4️⃣ الشاشة 4: إنشاء الحساب النهائي وتثبيت اللقطة
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password, snapshot } = req.body;
      
      res.status(201).json({
        message: 'تم إنشاء وتفعيل حسابك الموحد على نظام قرار بنجاح! توجه لشاشة الدخول الروتيني.',
        user: { username, role: snapshot?.is_tot_trainer ? 'volunteer_trainer' : 'volunteer' }
      });
    } catch (error) {
      res.status(500).json({ error: 'فشل تفعيل الحساب النهائي' });
    }
  }
};
