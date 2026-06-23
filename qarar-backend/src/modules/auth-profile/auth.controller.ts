import { Request, Response } from 'express';

// محاكاة سريعة لقاعدة بيانات الحصر المؤقتة في وضع التطوير
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

  // 2️⃣ الشاشة 2: فحص المعرف في لقطة نظام الحصر
  verifyVolunteer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { volunteer_id } = req.body;
      const volunteer = mockVolunteerDb.find(v => v.volunteer_id === volunteer_id);

      if (!volunteer) {
        res.status(404).json({ error: 'رقم المتطوع الموحد غير مدرج في لقطة بيانات الحصر الحالية' });
        return;
      }

      const masked = volunteer.whatsapp.replace(/^(\+\d{5})(\d{4})(\d{3})$/, '$1****$3');
      res.status(200).json({
        message: 'المتطوع مدرج بالحصر، تم إرسال الرمز للواتساب المعتمد',
        masked_whatsapp: masked,
        snapshot: volunteer
      });
    } catch (error) {
      res.status(500).json({ error: 'خطأ أثناء فحص الحصر' });
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
