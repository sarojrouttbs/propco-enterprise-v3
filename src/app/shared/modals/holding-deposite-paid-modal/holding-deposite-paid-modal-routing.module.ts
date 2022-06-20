import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HoldingDepositePaidModalPage } from './holding-deposite-paid-modal.page';

const routes: Routes = [
  {
    path: '',
    component: HoldingDepositePaidModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HoldingDepositePaidModalPageRoutingModule {}
