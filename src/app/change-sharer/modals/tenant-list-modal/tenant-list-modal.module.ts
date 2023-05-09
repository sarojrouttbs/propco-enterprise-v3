import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TenantListModalPageRoutingModule } from './tenant-list-modal-routing.module';

import { TenantListModalPage } from './tenant-list-modal.page';
import { DataTablesModule } from 'angular-datatables';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    TenantListModalPageRoutingModule,
    DataTablesModule,
    PipesModule
  ],
  declarations: [TenantListModalPage]
})
export class TenantListModalPageModule {}
