import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CallInfoModalPage } from './call-info-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CallInfoModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CallInfoModalPageRoutingModule {}
