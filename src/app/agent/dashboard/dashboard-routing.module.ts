import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';
import { GoogleMapComponent } from 'src/app/shared/components/google-map/google-map.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage
  },
  {
    path: 'google',
    component: GoogleMapComponent
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
