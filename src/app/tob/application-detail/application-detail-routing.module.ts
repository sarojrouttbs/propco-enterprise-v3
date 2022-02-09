import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationDetailPage } from './application-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ApplicationDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationDetailPageRoutingModule {}
