import { Router, Request, Response, NextFunction } from 'express';
import overviewRoutes from './overview/overview.routes';
import renderRoutes from './monitoring/render/render.routes'; 

// TODO: قم بإلغاء التعليق واستيراد مديول التحقق من التوكن الحقيقي الخاص بنظام قرار إذا كان متوفراً لديك
// import { verifyToken } from '../../middlewares/auth.middleware'; 

const router = Router();

// 🛡️ حارس أمان صارم للتحقق من رتبة الـ Super Admin
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user; 

  // تأمين إضافي: التحقق من وجود المستخدم وتطابق الرتبة
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'وصول مرفوض: هذه المنطقة مخصصة حصرياً للمطور المسؤول عن المنظومة (Super Admin)'
    });
  }
  next();
};

/**
 * حقن الحماية على كل الروابط
 * ملحوظة: إذا كنت تطبق مديول التحقق من التوكن (مثل verifyToken) بشكل عام في ملف server.ts، فالوضع آمن تماماً.
 * إذا لم تكن تطبقه بشكل عام، يفضّل تمريره هنا قبل requireSuperAdmin مثل: router.use('/monitoring/render', verifyToken, requireSuperAdmin, renderRoutes);
 */
router.use('/overview', requireSuperAdmin, overviewRoutes);
router.use('/monitoring/render', requireSuperAdmin, renderRoutes); 

export default router;
