import { Router } from 'express';
import { getRenderStatus, getRenderLogs, triggerRenderDeploy } from './render.controller';

const renderRoutes = Router();

// مسارات المراقبة الفورية لسيرفر ريندر
renderRoutes.get('/status', getRenderStatus);
renderRoutes.get('/logs', getRenderLogs);

// ميزة التحكم المتقدمة: إطلاق عملية نشر وبناء جديدة للمنظومة
renderRoutes.post('/deploy', triggerRenderDeploy);

export default renderRoutes;
