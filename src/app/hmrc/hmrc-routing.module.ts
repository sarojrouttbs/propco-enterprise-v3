import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HmrcPage } from './hmrc.page';
import { ProgressSummaryComponent } from './self-assessment-form/progress-summary/progress-summary.component';
import { SelfAssessmentFormComponent } from './self-assessment-form/self-assessment-form.component';

const routes: Routes = [
  {
    path: '',
    component: HmrcPage,
    children: [
      {
        path: 'self-assessment-form',
        component: SelfAssessmentFormComponent,
      },
      {
        path: 'progress-summary',
        component: ProgressSummaryComponent,
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HmrcPageRoutingModule { }
