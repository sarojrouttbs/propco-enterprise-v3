import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchPropertyPage } from './search-property.page';

const routes: Routes = [
  {
    path: '',
    component: SearchPropertyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchPropertyPageRoutingModule {}
