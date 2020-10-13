import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FaultsPage } from './faults.page';

const routes: Routes = [
  {
    path: '',
    component: FaultsPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaultsPageRoutingModule {}
