import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationDetailsPage } from './application-details.page';

const routes: Routes = [
  {
    path: '',
    component: ApplicationDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationDetailsPageRoutingModule {}
