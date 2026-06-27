import express from 'express';
import { updateProfileController } from './personal-data.controller';

const router = express.Router();

// 📥 الرابط الداخلي المباشر لتحديث البيانات الشخصية
router.post('/update', updateProfileController);

export default router;
