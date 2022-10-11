import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RejectionModalPage } from './rejection-modal.page';

const routes: Routes = [
  {
    path: '',
    component: RejectionModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RejectionModalPageRoutingModule {}
