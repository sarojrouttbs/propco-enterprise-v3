import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationListPage } from './application-list.page';

const routes: Routes = [
  {
    path: '',
    component: ApplicationListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationListPageRoutingModule {}
