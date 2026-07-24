import { Router } from 'express';
import { TasksEngineController } from './tasks-engine.controller';
import { authMiddleware } from '../../../../middlewares/authMiddleware';

const router = Router();

// تطبيق الحماية والمصادقة على كافة مسارات الموديول
router.use(authMiddleware);

// مسارات الأنشطة
router.post('/activities', TasksEngineController.createActivity);
router.get('/activities', TasksEngineController.getActivities);

// مسارات المهام
router.post('/tasks', TasksEngineController.createTask);
router.get('/tasks', TasksEngineController.getTasks);

// سوق الفرص والاعتذارات
router.post('/tasks/:id/apply', TasksEngineController.applyForTask);
router.post('/assignments/:assignmentId/excuse', TasksEngineController.submitExcuse);

export default router;
