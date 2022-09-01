import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HmrcReportPage } from './hmrc-report.page';

const routes: Routes = [
  {
    path: '',
    component: HmrcReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HmrcReportPageRoutingModule {}
