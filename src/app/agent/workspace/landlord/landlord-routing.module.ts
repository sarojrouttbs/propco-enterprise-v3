import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactInfoComponent } from './contact-info/contact-info.component';

import { LandlordPage } from './landlord.page';

const routes: Routes = [
  {
    path: ':landlordId',
    component: LandlordPage,
    children: [
      {
        path: 'contact-info',
        component: ContactInfoComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandlordPageRoutingModule {}
