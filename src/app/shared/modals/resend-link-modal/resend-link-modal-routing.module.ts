import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResendLinkModalPage } from './resend-link-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ResendLinkModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResendLinkModalPageRoutingModule {}
