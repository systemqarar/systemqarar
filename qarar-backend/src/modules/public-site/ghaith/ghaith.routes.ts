import { Router } from 'express';
import { handleGhaithChat } from './ghaith.controller';

const router = Router();

// مسار استقبال الأسئلة والدردشة مع حفظ الجلسة
router.post('/ask', handleGhaithChat);

export default router;
