import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
    is_acting: boolean;
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'عذراً، الوصول غير مصرح به. يرجى تسجيل الدخول أولاً' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'qarar-secret-key-2026-strict';
    const decoded = jwt.verify(token, jwtSecret) as any;

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      is_acting: decoded.is_acting,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'جلسة العمل انتهت أو الرمز غير صالح، اعد تسجيل الدخول' });
  }
};
