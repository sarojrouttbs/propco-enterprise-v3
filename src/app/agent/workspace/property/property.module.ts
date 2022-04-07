import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyPageRoutingModule } from './property-routing.module';

import { PropertyPage } from './property.page';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DetailsComponent } from './details/details.component';
import { PropertyLandlordTenantComponent } from './property-landlord-tenant/property-landlord-tenant.component';
import { ImagePageModule } from 'src/app/shared/modals/image/image.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "",
    component: PropertyPage,
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
      },
      {
        path: "details",
        component: DetailsComponent,
      },
      {
        path: "dashboard2",
        component: DashboardComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // PropertyPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    ImagePageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PropertyPage, DashboardComponent, DetailsComponent, PropertyLandlordTenantComponent],
  // exports:[PropertyPage]
})
export class PropertyPageModule {}
