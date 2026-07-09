import { Router } from 'express'; // تم تصحيح حرف i الصغير هنا
import { ExecutiveBoardController } from './executive-board.controller';
// import { protect, requireSuperAdmin } from '../../../middleware/auth.middleware'; // ◄ فك التجميد هنا مستقبلاً لحماية الراوتس

const router = Router();

// 1. جلب بيانات الهيكل الإداري والمتطوعين المتاحين عند فتح الشاشة
// الرابط الكامل: /api/executive-board/board-data
router.get('/board-data', ExecutiveBoardController.getBoardData);

// 2. إرسال طلب تعيين منصب جديد لمتطوع
// الرابط الكامل: /api/executive-board/assign
router.post('/assign', ExecutiveBoardController.assignVolunteer);

// 3. إرسال طلب إعفاء عضو وإعادته لمرتبة متطوع عادي
// الرابط الكامل: /api/executive-board/exempt
router.post('/exempt', ExecutiveBoardController.exemptVolunteer);

export default router;
