import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgreementClauseModalPage } from './agreement-clause-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AgreementClauseModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgreementClauseModalPageRoutingModule {}
