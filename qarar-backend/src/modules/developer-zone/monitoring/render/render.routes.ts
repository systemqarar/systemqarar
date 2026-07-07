import { Router } from 'express';
import { getRenderStatus, getRenderLogs } from './render.controller';

const renderRoutes = Router();

// مسارات المراقبة الفورية لسيرفر ريندر
renderRoutes.get('/status', getRenderStatus);
renderRoutes.get('/logs', getRenderLogs);

export default renderRoutes;
