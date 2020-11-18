import { AuthGuard } from '../../shared/authguard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LetAlliancePage } from './let-alliance.page';

const routes: Routes = [
  {
    path: '',
    component: LetAlliancePage,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'application-list',
        loadChildren: () => import('./application-list/application-list.module').then( m => m.ApplicationListPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LetAlliancePageRoutingModule { }
