// src/modules/unified-dashboard/volunteer-profile/volunteer-profile.routes.ts

import { Router } from 'express';
import personalDataRoutes from './personal-data/personal-data.routes';

const volunteerProfileRouter = Router();

// 🎯 التعديل السحري هنا: غيّرنا المسار لـ '/profile' عشان يطابق طلب الواجهة (Frontend) تماماً
volunteerProfileRouter.use('/profile', personalDataRoutes);

/* مستقبلاً: volunteerProfileRouter.use('/digital-card', digitalCardRoutes); */

export default volunteerProfileRouter;
