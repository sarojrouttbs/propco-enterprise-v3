import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeSharerPageRoutingModule } from './change-sharer-routing.module';

import { ChangeSharerPage } from './change-sharer.page';
import { TenantListModalPageModule } from './modals/tenant-list-modal/tenant-list-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeSharerPageRoutingModule,
    TenantListModalPageModule
  ],
  declarations: [ChangeSharerPage]
})
export class ChangeSharerPageModule {}
