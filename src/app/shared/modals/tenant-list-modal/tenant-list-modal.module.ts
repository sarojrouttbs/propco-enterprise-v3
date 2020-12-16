import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TenantListModalPageRoutingModule } from './tenant-list-modal-routing.module';

import { TenantListModalPage } from './tenant-list-modal.page';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TenantListModalPageRoutingModule,
    DataTablesModule
  ],
  declarations: [TenantListModalPage]
})
export class TenantListModalPageModule {}