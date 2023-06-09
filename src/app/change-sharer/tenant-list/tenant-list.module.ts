import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TenantListPageRoutingModule } from './tenant-list-routing.module';

import { TenantListPage } from './tenant-list.page';
import { DataTablesModule } from 'angular-datatables';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TenantListPageRoutingModule,
    DataTablesModule,
    PipesModule
  ],
  exports: [TenantListPage],
  declarations: [TenantListPage]
})
export class TenantListPageModule {}
