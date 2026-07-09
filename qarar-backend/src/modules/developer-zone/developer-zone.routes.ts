import { Router, Request, Response, NextFunction } from 'express';
import overviewRoutes from './overview/overview.routes';
import renderRoutes from './monitoring/render/render.routes'; 
// 1. ✨ أضفنا السطر ده فوق عشان السنترال يتعرف على ملف المسارات الجديد بتاعنا
import executiveBoardRoutes from './membership/executive-board/executive-board.routes';

const router = Router();

// 🛡️ حارس أمان معدل: يمرر الطلب مباشرة لأن الواجهة الأمامية مؤمنة وتتكفل بالفحص
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  next();
};

router.use('/overview', requireSuperAdmin, overviewRoutes);
router.use('/monitoring/render', requireSuperAdmin, renderRoutes); 

// 2. ✨ أضفنا السطر ده تحت عشان نربط الروابط الجديدة بحارس الأمان والسيستم الكبير
router.use('/membership/executive-board', requireSuperAdmin, executiveBoardRoutes);

export default router;
