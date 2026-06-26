import { Router } from 'express';
import { authController } from './auth.controller'; 

const router = Router();

// ربط المسارات بالدوال المصممة لشاشات النظام (مطابقة للكنترولر بنسبة 100%)
router.post('/login', authController.login);
router.post('/verify-volunteer', authController.verifyVolunteer);
router.post('/verify-otp', authController.verifyOTP); // 🌟 ثبتناها كابيتال كما هي في ملفك لتشتغل صح
router.post('/emergency-request', authController.emergencyRequest);
router.post('/register', authController.register);

export default router;
