import { Router } from 'express';
import tasksEngineRoutes from './tasks-engine/tasks-engine.routes';

const router = Router();

// دمج مسارات محرك المهام داخل الوحدة الرئيسية
router.use('/tasks-engine', tasksEngineRoutes);

export default router;
