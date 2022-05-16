import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisplayAsModalPage } from './display-as-modal.page';

const routes: Routes = [
  {
    path: '',
    component: DisplayAsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisplayAsModalPageRoutingModule {}
