import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

// خريطة مسارات بوابة الأمان والتحقق بنظام قرار
router.post('/verify-volunteer', AuthController.verifyVolunteer);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/emergency-request', AuthController.emergencyRequest);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;
