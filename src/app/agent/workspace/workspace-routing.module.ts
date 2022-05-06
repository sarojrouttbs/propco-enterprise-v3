import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspacePage } from './workspace.page';

const routes: Routes = [
  {
    path: '',
    component: WorkspacePage,
    children: [
      {
        path: 'property/:propertyId',
        loadChildren: () => import(`./property/property.module`)
        .then(m => m.PropertyPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspacePageRoutingModule { }
