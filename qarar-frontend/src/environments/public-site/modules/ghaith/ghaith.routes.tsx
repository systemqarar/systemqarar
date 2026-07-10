import React from 'react';
import GhaithPage from './pages/GhaithPage';

// تعريف هيكل المسار بدقة لمنع الـ any تماماً
interface GhaithRouteConfig {
  path: string;
  element: React.ReactNode;
}

export const ghaithRoutes: GhaithRouteConfig[] = [
  {
    path: 'ghaith-test',
    element: <GhaithPage />,
  },
];
