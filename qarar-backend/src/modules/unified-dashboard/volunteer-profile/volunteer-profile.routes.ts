// src/modules/unified-dashboard/volunteer-profile/volunteer-profile.routes.ts

import { Router } from 'express';
import personalDataRoutes from './personal-data/personal-data.routes';
// 🏆 استيراد موديول المسارات الجديد الخاص بالشهادات والبطاقات الرقمية
import certificatesCardsRoutes from './certificates-cards/certificates-cards.routes';

const volunteerProfileRouter = Router();

// 🪪 مسار البيانات الشخصية الأساسي
volunteerProfileRouter.use('/profile', personalDataRoutes);

// 🎖️ التوجيه السحري والمظبوط: ربط مسار الشهادات ليتطابق مع طلب الفرونتد تماماً
volunteerProfileRouter.use('/profile/certificates-cards', certificatesCardsRoutes);

export default volunteerProfileRouter;
