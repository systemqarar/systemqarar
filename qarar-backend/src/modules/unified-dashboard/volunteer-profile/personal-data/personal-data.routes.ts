// src/modules/unified-dashboard/volunteer-profile/personal-data/personal-data.routes.ts

import { Router } from 'express';
import { PersonalDataController } from './personal-data.controller';

const router = Router();
const controller = new PersonalDataController();

// 🎯 الخانة الفاضية سميناها identifier عشان تستقبل الـ SRCS-2026-9000 مباشرة وتمررها للموديل
router.get('/:identifier', controller.getProfileData);

// 📥 مسار حفظ وتحديث البيانات الشخصية
router.post('/update', controller.saveProfileData);

export default router;
