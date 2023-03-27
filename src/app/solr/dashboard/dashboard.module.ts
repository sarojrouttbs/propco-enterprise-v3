import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { MaterialModule } from 'src/app/material.module';
import { GuidedTourModule, GuidedTourService } from 'ngx-guided-tour';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { SearchPropertyPageModule } from 'src/app/shared/modals/search-property/search-property.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    ComponentsModule,
    GuidedTourModule,
    SearchPropertyPageModule
  ],
  declarations: [DashboardPage],
  providers: [GuidedTourService],
})
export class DashboardPageModule {}
