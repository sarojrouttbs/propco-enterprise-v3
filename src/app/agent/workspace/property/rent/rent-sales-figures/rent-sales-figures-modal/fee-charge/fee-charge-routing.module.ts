import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeeChargePage } from './fee-charge.page';

const routes: Routes = [
  {
    path: '',
    component: FeeChargePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeeChargePageRoutingModule {}
