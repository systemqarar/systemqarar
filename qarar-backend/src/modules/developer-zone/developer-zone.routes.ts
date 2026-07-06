import { Router, Request, Response, NextFunction } from 'express';
import overviewRoutes from './overview/overview.routes';
// نفترض وجود الميدل وير الخاص بالتحقق من التوكن في مشروعك، قم باستيراده هنا
// import { verifyToken } from '../../middlewares/auth.middleware'; 

const router = Router();

// 🛡️ حارس أمان صارم على مستوى الباكند للتحقق من رتبة الـ Super Admin
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  // ملاحظة: الميدل وير الأساسي (مثل verifyToken) مفترض يفك التوكن ويضع بيانات المستخدم في req.user
  const user = (req as any).user; 

  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'وصول مرفوض: هذه المنطقة مخصصة حصرياً للمطور المسؤول عن المنظومة (Super Admin)'
    });
  }
  next();
};

// حقن الحماية على كل الروابط التي تقع تحت هذا الموديول
// (إذا كان لديك ميدل وير للتوكن كـ verifyToken ضعه قبل requireSuperAdmin)
router.use('/overview', requireSuperAdmin, overviewRoutes);

export default router;
