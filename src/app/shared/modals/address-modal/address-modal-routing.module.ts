import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddressModalPage } from './address-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddressModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressModalPageRoutingModule {}
