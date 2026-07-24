import { RouteObject } from 'react-router-dom';
import { TasksEnginePage } from './tasks-engine/pages/TasksEnginePage';

export const tasksActivitiesRoutes: RouteObject[] = [
  {
    path: 'tasks-activities',
    element: <TasksEnginePage />,
  },
];
