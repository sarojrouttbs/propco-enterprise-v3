import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TenantListPage } from './tenant-list.page';

const routes: Routes = [
  {
    path: '',
    component: TenantListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenantListPageRoutingModule {}
