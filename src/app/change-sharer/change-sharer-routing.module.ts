import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangeSharerPage } from './change-sharer.page';

const routes: Routes = [
  {
    path: '',
    component: ChangeSharerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangeSharerPageRoutingModule {}
