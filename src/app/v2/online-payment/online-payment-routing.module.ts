import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OnlinePaymentPage } from './online-payment.page';

const routes: Routes = [
  {
    path: '',
    component: OnlinePaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnlinePaymentPageRoutingModule {}
