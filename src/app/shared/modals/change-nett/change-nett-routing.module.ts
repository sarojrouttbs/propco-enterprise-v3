import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeNettPage } from './change-nett.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeNettPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeNettPageRoutingModule {}
