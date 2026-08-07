import { RouteObject } from 'react-router-dom';
import { TasksEnginePage } from './tasks-engine/pages/TasksEnginePage';
import { ActivityDetailsPage } from './tasks-engine/pages/ActivityDetailsPage';

export const tasksActivitiesRoutes: RouteObject[] = [
  {
    path: 'tasks-activities',
    children: [
      {
        index: true,
        element: <TasksEnginePage />,
      },
      {
        path: 'activities/:id',
        element: <ActivityDetailsPage />,
      },
    ],
  },
];
