import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspacePage } from './workspace.page';

const routes: Routes = [
  {
    path: '',
    component: WorkspacePage,
    children: [
      { path: 'property/:pid', loadChildren: () => import(`./property-dashboard/property-dashboard.module`).then(m => m.PropertyDashboardPageModule) },
    ]
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspacePageRoutingModule {}
