import { Router } from 'express';
import personalDataRoutes from './personal-data/personal-data.routes';

const volunteerProfileRouter = Router();

// ربط قسم البيانات الشخصية بالراوتر العام للبروفايل
volunteerProfileRouter.use('/personal-data', personalDataRoutes);
/* مستقبلاً: volunteerProfileRouter.use('/digital-card', digitalCardRoutes); */

export default volunteerProfileRouter;
