import { RouteObject } from 'react-router-dom';
import { TasksEnginePage } from './tasks-engine/pages/TasksEnginePage';
import { ActivityDetailsPage } from './tasks-engine/pages/ActivityDetailsPage';

export const tasksActivitiesRoutes: RouteObject[] = [
  {
    path: 'tasks-activities',
    element: <TasksEnginePage />,
  },
  {
    path: 'tasks-activities/activities/:id',
    element: <ActivityDetailsPage />,
  },
];
