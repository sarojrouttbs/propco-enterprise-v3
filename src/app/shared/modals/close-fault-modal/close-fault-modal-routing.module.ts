import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CloseFaultModalPage } from './close-fault-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CloseFaultModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CloseFaultModalPageRoutingModule {}
