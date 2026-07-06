import { RouteObject } from 'react-router-dom';
import { overviewRoutes } from './modules/overview/overview.routes';

// هنا بنجمع كل روتيس الموديولات الفرعية الخاصة بالمطور في مصفوفة واحدة ليقرأها ملف الأب
export const developRoutes: RouteObject[] = [
  ...overviewRoutes
  // مستقبلاً لما تضيف موديول جديد وتعمل الروت الفرعي بتاعه، بتنزله هنا كدا:
  // ...myNewModuleRoutes
];
