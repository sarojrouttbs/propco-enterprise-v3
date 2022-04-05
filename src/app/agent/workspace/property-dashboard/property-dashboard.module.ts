import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyDashboardPageRoutingModule } from './property-dashboard-routing.module';

import { PropertyDashboardPage } from './property-dashboard.page';
import { MaterialModule } from 'src/app/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyDashboardPageRoutingModule,
    MaterialModule
  ],
  declarations: [PropertyDashboardPage],
  exports:[PropertyDashboardPage]
})
export class PropertyDashboardPageModule {}
