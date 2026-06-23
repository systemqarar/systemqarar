import { Router } from 'express';
import { authController } from './auth.controller'; // التعديل هنا: استخدام الحرف الصغير المطابق

const router = Router();

// ربط المسارات بالدوال المصممة للشاشات الأربعة
router.post('/login', authController.login);
router.post('/verify-volunteer', authController.verifyVolunteer);
router.post('/verify-otp', authController.verifyOTP);
router.post('/emergency-request', authController.emergencyRequest);
router.post('/register', authController.register);

export default router;
