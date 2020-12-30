import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchApplicationPage } from './search-application.page';

const routes: Routes = [
  {
    path: '',
    component: SearchApplicationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchApplicationPageRoutingModule {}
