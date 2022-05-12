import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarketAppraisalPage } from './market-appraisal.page';

const routes: Routes = [
  {
    path: '',
    component: MarketAppraisalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketAppraisalPageRoutingModule {}
