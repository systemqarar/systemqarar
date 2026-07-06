import { Router } from 'express';
import { getDeveloperStats } from './overview.controller';

const router = Router();

// مسار فرعي لجلب الإحصائيات: GET /api/developer-zone/overview/stats
router.get('/stats', getDeveloperStats);

export default router;
