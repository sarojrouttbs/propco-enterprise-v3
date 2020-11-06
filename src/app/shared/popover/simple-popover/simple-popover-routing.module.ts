import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimplePopoverPage } from './simple-popover.page';

const routes: Routes = [
  {
    path: '',
    component: SimplePopoverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SimplePopoverPageRoutingModule {}
