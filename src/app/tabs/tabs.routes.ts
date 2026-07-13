import { Routes } from '@angular/router';
import { HomePage } from './home/home';
import { LogPage } from './log/log';
import { Tabs } from './tabs';
import { TrainingPage } from './training/training';
import { TrendsPage } from './trends/trends';

export const routes: Routes = [
  {
    path: 'tabs',
    component: Tabs,
    children: [
      {
        path: 'home',
        component: HomePage,
      },
      {
        path: 'training',
        component: TrainingPage,
      },
      {
        path: 'log',
        component: LogPage,
      },
      {
        path: 'log/:programId',
        component: LogPage,
      },
      {
        path: 'trends',
        component: TrendsPage,
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
