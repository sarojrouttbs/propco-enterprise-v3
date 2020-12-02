import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TenantListModalPage } from './tenant-list-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TenantListModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenantListModalPageRoutingModule {}
