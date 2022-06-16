import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HmrcPage } from './hmrc.page';
import { SelfAssessmentFormComponent } from './self-assessment-form/self-assessment-form.component';

const routes: Routes = [
  {
    path: '',
    component: HmrcPage,
    children: [
      {
        path: 'self-assessment-form',
        component: SelfAssessmentFormComponent,
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HmrcPageRoutingModule { }
