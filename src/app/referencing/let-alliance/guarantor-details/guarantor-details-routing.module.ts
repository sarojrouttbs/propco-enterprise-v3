import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GuarantorDetailsPage } from './guarantor-details.page';

const routes: Routes = [
  {
    path: '',
    component: GuarantorDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuarantorDetailsPageRoutingModule {}
