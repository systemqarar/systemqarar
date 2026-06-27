import express from 'express';
import { updateProfileController, getProfileController } from './personal-data.controller';

const router = express.Router();

// 📥 الرابط الداخلي المباشر لتحديث وحفظ البيانات الشخصية (POST)
router.post('/update', updateProfileController);

// 📤 الرابط الداخلي المباشر لجلب وقراءة البيانات الحقيقية برقم العضوية (GET)
router.get('/:volunteerId', getProfileController);

export default router;
