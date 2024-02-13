import { AuthGuard } from './../shared/authguard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FaultsPage } from './faults.page';

const routes: Routes = [
  {
    path: '',
    component: FaultsPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule),
        data: { preload: true, delay: 0 },
      },
      {
        path: 'add',
        loadChildren: () => import('./details/details.module').then( m => m.DetailsPageModule),
        data: { preload: true, delay: 0 }
      },
      {
        path: ':id/details',
        loadChildren: () => import('./details/details.module').then( m => m.DetailsPageModule),
        data: { preload: true, delay: 0 },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaultsPageRoutingModule {}
