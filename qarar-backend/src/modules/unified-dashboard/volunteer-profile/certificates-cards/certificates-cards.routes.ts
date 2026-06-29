// src/modules/unified-dashboard/volunteer-profile/certificates-cards/certificates-cards.routes.ts

import { Router } from 'express';
import { CertificatesCardsController } from './certificates-cards.controller';

const router = Router();
const controller = new CertificatesCardsController();

// رابط جلب السجل الرقمي (يدعم الـ UUID والـ Volunteer Number لأعلى مرونة)
router.get('/:identifier', controller.getCertificatesAndCard);

export default router;
