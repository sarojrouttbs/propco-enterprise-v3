import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TermsAndConditionModalPage } from './terms-and-condition-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TermsAndConditionModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermsAndConditionModalPageRoutingModule {}
