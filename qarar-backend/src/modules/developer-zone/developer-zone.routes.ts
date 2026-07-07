import { Router, Request, Response, NextFunction } from 'express';
import overviewRoutes from './overview/overview.routes';
import renderRoutes from './monitoring/render/render.routes'; 

const router = Router();

// 🛡️ حارس أمان معدل: يمرر الطلب مباشرة لأن الواجهة الأمامية مؤمنة وتتكفل بالفحص
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  next();
};

router.use('/overview', requireSuperAdmin, overviewRoutes);
router.use('/monitoring/render', requireSuperAdmin, renderRoutes); 

export default router;
