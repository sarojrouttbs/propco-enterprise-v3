import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SearchApplicationPageModule } from 'src/app/shared/modals/search-application/search-application.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MatAutocompleteModule,
    SearchApplicationPageModule
  ],
  declarations: [DashboardPage],
  providers: []
})
export class DashboardPageModule {}
