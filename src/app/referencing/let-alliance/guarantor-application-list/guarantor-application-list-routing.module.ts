import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GuarantorApplicationListPage } from './guarantor-application-list.page';

const routes: Routes = [
  {
    path: '',
    component: GuarantorApplicationListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuarantorApplicationListPageRoutingModule {}
