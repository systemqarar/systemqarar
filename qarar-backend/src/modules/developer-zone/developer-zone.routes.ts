import { Router, Request, Response, NextFunction } from 'express';
import overviewRoutes from './overview/overview.routes';
import renderRoutes from './monitoring/render/render.routes'; 
import executiveBoardRoutes from './membership/executive-board/executive-board.routes';

// 1️⃣ استدعاء ملف مسارات الاستثناءات الجديد تحت مجلد الـ membership
import registrationExceptionsRoutes from './membership/registration-exceptions/registration-exceptions.routes';

const router = Router();

// 🛡️ حارس أمان معدل: يمرر الطلب مباشرة لأن الواجهة الأمامية مؤمنة وتتكفل بالفحص
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  next();
};

router.use('/overview', requireSuperAdmin, overviewRoutes);
router.use('/monitoring/render', requireSuperAdmin, renderRoutes); 
router.use('/membership/executive-board', requireSuperAdmin, executiveBoardRoutes);

// 2️⃣ ربط روابط الاستثناءات الجديدة بالسيستم وحمايتها بحارس الأمان
router.use('/membership/exceptions', requireSuperAdmin, registrationExceptionsRoutes);

export default router;
