import { Router } from 'express';
import { PersonalDataController } from './personal-data.controller';

const router = Router();
const controller = new PersonalDataController();

// 🛣️ مسارات قسم البيانات الشخصية
router.get('/:volunteerId', controller.getProfileData);
router.post('/update', controller.saveProfileData);

export default router;
