import { Router } from 'express';
import lettersDocumentRoutes from './letters-reports/letters-document/letters-document.routes';

const router = Router();

// 1. ربط مسارات موديول الخطابات والوثائق
router.use('/document', lettersDocumentRoutes);

// 2. مستقبلاً لما نشتغل التقارير، حنربطها هنا مباشرة بدون ما نلخبط أي ملف تاني
// router.use('/reports', reportsRoutes);

export default router;
