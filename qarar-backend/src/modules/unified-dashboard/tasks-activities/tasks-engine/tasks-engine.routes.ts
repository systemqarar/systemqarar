import { Router } from 'express';
import { TasksEngineController } from './tasks-engine.controller';
import { requireAuth } from '../../../../middlewares/authMiddleware';

const router = Router();

// تطبيق الحماية والمصادقة على كافة مسارات الموديول
router.use(requireAuth);

// ==================== مسارات الأنشطة واللجان ====================
router.post('/activities', TasksEngineController.createActivity);
router.get('/activities', TasksEngineController.getActivities);

// 🎯 المسار الذي كان مفقوداً وتسبب في خطأ 404 والطرد:
router.get('/activities/:id', TasksEngineController.getActivityById);
router.post('/activities/:id/committees', TasksEngineController.addCommittee);

// ==================== مسارات المهام ====================
router.post('/tasks', TasksEngineController.createTask);
router.get('/tasks', TasksEngineController.getTasks);
router.patch('/tasks/:id', TasksEngineController.updateTask);

// ==================== سوق الفرص، الاعتذارات، وإدارة التكليفات ====================
router.post('/tasks/:id/apply', TasksEngineController.applyForTask);
router.post('/assignments/:assignmentId/excuse', TasksEngineController.submitExcuse);
router.delete('/assignments/:assignmentId', TasksEngineController.removeVolunteer);

export default router;
