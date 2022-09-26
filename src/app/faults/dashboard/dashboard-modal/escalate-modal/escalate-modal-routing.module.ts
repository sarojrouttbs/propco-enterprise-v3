import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EscalateModalPage } from './escalate-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EscalateModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EscalateModalPageRoutingModule {}
