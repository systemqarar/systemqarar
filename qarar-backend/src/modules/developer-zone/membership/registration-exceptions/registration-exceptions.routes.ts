import { Router } from 'express';
import { registrationExceptionsController } from './registration-exceptions.controller';

const router = Router();

// الروابط المفتوحة للوحة المطور للتحكم في الاستثناءات
router.get('/search/:volunteer_number', registrationExceptionsController.searchInHasr);
router.post('/', registrationExceptionsController.createException);
router.get('/', registrationExceptionsController.getExceptionsList);
router.delete('/:id', registrationExceptionsController.deleteException);

export default router;
