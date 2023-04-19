import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StripeElementPage } from './stripe-element.page';

const routes: Routes = [
  {
    path: '',
    component: StripeElementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StripeElementPageRoutingModule {}
