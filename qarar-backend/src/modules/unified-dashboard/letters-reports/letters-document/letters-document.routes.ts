import { Router } from 'express';
import { LettersDocumentController } from './letters-document.controller';
// حماية المسار والتحقق من صلاحية الجلسة والمشرف
import { requireAuth } from '../../../../middlewares/authMiddleware'; 

const router = Router();

// مسار إنشاء خطاب رسمي جديد (وتوليد إشعارات سوكيت فورا)
router.post('/create', requireAuth, LettersDocumentController.createLetter);

// مسار استدعاء ذكاء جيمني لصياغة الخطاب تلقائياً
router.post('/ai-draft', requireAuth, LettersDocumentController.generateAIDraft);

// مسارات الصناديق (الوارد والصادر)
router.get('/inbox', requireAuth, LettersDocumentController.getInbox);
router.get('/sent', requireAuth, LettersDocumentController.getSent);

export default router;
