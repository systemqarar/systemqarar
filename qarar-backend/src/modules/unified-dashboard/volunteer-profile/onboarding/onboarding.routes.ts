// src/modules/unified-dashboard/volunteer-profile/onboarding/onboarding.routes.ts

import { Router } from 'express';
import { completeOnboarding } from './onboarding.controller';
import { requireAuth } from '../../../services/authMiddleware'; // حارس المنظومة

const router = Router();

// رابط الباكيند النهائي ح يكون: /profile/onboarding/complete
router.post('/complete', requireAuth, completeOnboarding);

export default router;
