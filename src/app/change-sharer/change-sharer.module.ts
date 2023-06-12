import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeSharerPageRoutingModule } from './change-sharer-routing.module';

import { ChangeSharerPage } from './change-sharer.page';
import { TenantListPageModule } from './tenant-list/tenant-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeSharerPageRoutingModule,
    TenantListPageModule
  ],
  declarations: [ChangeSharerPage]
})
export class ChangeSharerPageModule {}
