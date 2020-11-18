import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplicationListPageRoutingModule } from './application-list-routing.module';

import { ApplicationListPage } from './application-list.page';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ApplicationListPageRoutingModule,
    DataTablesModule
  ],
  declarations: [ApplicationListPage]
})
export class ApplicationListPageModule {}
